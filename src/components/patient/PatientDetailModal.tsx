
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Tabs } from '@/components/ui/tabs';
import PatientModalHeader from './modal/PatientModalHeader';
import PatientTabNavigation from './modal/PatientTabNavigation';
import PatientArchiveDialog from './PatientArchiveDialog';
import PatientDeleteDialog from './PatientDeleteDialog';
import PatientActionButtons from './modal/PatientActionButtons';
import PatientModalContent from './modal/PatientModalContent';
import { Patient } from '@/types';
import { usePatientModalActions } from '@/hooks/patient/usePatientModalActions';
import { usePatientTabs } from '@/hooks/patient/usePatientTabs';
import { usePatientDelete } from '@/hooks/patient/usePatientDelete';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PatientDetailModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  onStatusChange
}) => {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { activeTab, handleTabChange } = usePatientTabs();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Check if patient is available
  if (!patient || !patient.id) {
    console.error('Patient data is missing or invalid:', patient);
    toast({
      title: "Erro",
      description: "Dados do paciente não encontrados ou inválidos.",
      variant: "destructive"
    });
    return null;
  }
  
  const { 
    handleArchivePatient, 
    handleUpdatePatient,
    handleUpdatePatientNotes,
    isArchiving 
  } = usePatientModalActions({
    patient,
    onStatusChange,
    onClose
  });

  const { handleDeletePatient, isDeleting } = usePatientDelete(user?.id, () => {
    onClose();
    onStatusChange(); // Refresh the list after deletion
  });

  // Fix the Promise<void> return type issue
  const handlePatientUpdate = async (updatedData: Partial<Patient>): Promise<void> => {
    try {
      await handleUpdatePatient(updatedData);
    } catch (error) {
      logger.error('Error updating patient:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados do paciente.",
        variant: "destructive"
      });
    }
  };

  // Handle notes update with void return type
  const handleNotesUpdate = async (notes: string): Promise<void> => {
    try {
      await handleUpdatePatientNotes(notes);
    } catch (error) {
      logger.error('Error updating patient notes:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as anotações do paciente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    await handleDeletePatient(patient.id);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 h-[85vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <PatientModalHeader 
              patient={patient}
              onArchive={() => setShowArchiveDialog(true)}
              onDelete={() => setShowDeleteDialog(true)}
            />
          </DialogHeader>
          
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="px-6 border-b">
              <PatientTabNavigation />
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <PatientModalContent
                patient={patient}
                onUpdatePatient={handlePatientUpdate}
                onUpdateNotes={handleNotesUpdate}
              />
            </div>
          </Tabs>
          
          <div className="px-6 py-4 border-t">
            <PatientActionButtons onCancel={onClose} />
          </div>
        </DialogContent>
      </Dialog>
      
      <PatientArchiveDialog 
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        onArchive={handleArchivePatient}
        isArchiving={isArchiving}
        patientName={patient.name}
        status={patient.status || 'active'}
      />

      <PatientDeleteDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
        patientName={patient.name}
      />
    </>
  );
};

export default PatientDetailModal;
