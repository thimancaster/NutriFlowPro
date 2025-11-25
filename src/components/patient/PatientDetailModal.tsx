
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import PatientModalHeader from './modal/PatientModalHeader';
import PatientTabNavigation from './modal/PatientTabNavigation';
import PatientArchiveDialog from './PatientArchiveDialog';
import PatientDeleteDialog from './PatientDeleteDialog';
import PatientActionButtons from './modal/PatientActionButtons';
import { 
  PatientBasicInfoTab,
  PatientAppointmentsTab,
  PatientEvaluationsTab,
  PatientEvolutionTab,
  PatientNotesTab,
  PatientCalculationHistoryTab,
  PatientComparisonTab,
  PatientGoalsTab,
  PatientAlertsTab,
  PatientReportsTab
} from './tabs';
import { Patient } from '@/types';
import { usePatientModalActions } from '@/hooks/patient/usePatientModalActions';
import { usePatientTabs } from '@/hooks/patient/usePatientTabs';
import { usePatientDelete } from '@/hooks/patient/usePatientDelete';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // Debug logging
  console.log('PatientDetailModal rendering:', { patient, isOpen });
  
  // Check if patient is available
  if (!patient || !patient.id) {
    console.error('Patient data is missing or invalid:', patient);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <h2>Erro</h2>
          </DialogHeader>
          <div className="p-4">
            <p>Dados do paciente não encontrados ou inválidos.</p>
            <Button onClick={onClose} className="mt-4">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
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
    onStatusChange();
  });

  // Handle edit patient
  const handleEditPatient = () => {
    navigate(`/patients/edit/${patient.id}`);
    onClose();
  };

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
        <DialogContent className="max-w-6xl p-0 h-[85vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex justify-between items-start">
              <PatientModalHeader 
                patient={patient}
                onArchive={() => setShowArchiveDialog(true)}
                onDelete={() => setShowDeleteDialog(true)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditPatient}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Paciente
              </Button>
            </div>
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
              <TabsContent value="basic-info" className="mt-0 h-full">
                <PatientBasicInfoTab 
                  patient={patient} 
                  onUpdatePatient={handlePatientUpdate}
                />
              </TabsContent>
              
              <TabsContent value="evaluations" className="mt-0 h-full">
                <PatientEvaluationsTab patientId={patient.id} />
              </TabsContent>
              
              <TabsContent value="evolution" className="mt-0 h-full">
                <PatientEvolutionTab patientId={patient.id} />
              </TabsContent>
              
              <TabsContent value="calculation-history" className="mt-0 h-full">
                <PatientCalculationHistoryTab patientId={patient.id} />
              </TabsContent>
              
              <TabsContent value="comparison" className="mt-0 h-full">
                <PatientComparisonTab patientId={patient.id} />
              </TabsContent>
              
              <TabsContent value="goals" className="mt-0 h-full">
                <PatientGoalsTab 
                  patient={patient}
                  onUpdatePatient={handlePatientUpdate}
                />
              </TabsContent>
              
              <TabsContent value="alerts" className="mt-0 h-full">
                <PatientAlertsTab patient={patient} />
              </TabsContent>
              
              <TabsContent value="reports" className="mt-0 h-full">
                <PatientReportsTab patient={patient} />
              </TabsContent>
              
              <TabsContent value="appointments" className="mt-0 h-full">
                <PatientAppointmentsTab patientId={patient.id} />
              </TabsContent>
              
              <TabsContent value="notes" className="mt-0 h-full">
                <PatientNotesTab 
                  patient={patient}
                  onUpdatePatient={handlePatientUpdate}
                />
              </TabsContent>
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
