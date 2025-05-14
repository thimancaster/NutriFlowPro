
import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Patient } from '@/types';

// Import the extracted components
import PatientModalHeader from './modal/PatientModalHeader';
import PatientStatusIndicator from './modal/PatientStatusIndicator';
import PatientActionButtons from './modal/PatientActionButtons';
import PatientTabNavigation from './modal/PatientTabNavigation';
import PatientArchiveDialog from './modal/PatientArchiveDialog';

// Import tab content components
import PatientBasicInfo from './PatientBasicInfo';
import PatientAppointments from './PatientAppointments';
import PatientMealPlans from './PatientMealPlans';
import PatientEvaluations from './PatientEvaluations';
import PatientEvolution from './PatientEvolution';
import PatientNotes from './PatientNotes';

// Import custom hook for actions
import { usePatientModalActions } from '@/hooks/patient/usePatientModalActions';

interface PatientDetailModalProps {
  patient: Patient | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

const PatientDetailModal = ({ patient, open, onClose, onStatusChange }: PatientDetailModalProps) => {
  const {
    isArchiveDialogOpen,
    setIsArchiveDialogOpen,
    isLoading,
    handleEditClick,
    handleArchiveClick,
    handleReactivateClick,
    handleNewAppointment,
    handleStatusChange
  } = usePatientModalActions({ onClose, onStatusChange });
  
  if (!patient) return null;
  
  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          
          <DialogHeader>
            <PatientModalHeader patient={patient} onClose={onClose} />
          </DialogHeader>
          
          <div className="mb-5 flex items-center justify-between">
            <PatientStatusIndicator status={patient.status} />
            
            <PatientActionButtons 
              patient={patient}
              onEdit={() => handleEditClick(patient.id)}
              onArchive={handleArchiveClick}
              onReactivate={handleReactivateClick}
              onNewAppointment={handleNewAppointment}
            />
          </div>
          
          <Tabs defaultValue="info" className="w-full">
            <PatientTabNavigation />
            
            <TabsContent value="info">
              <PatientBasicInfo patient={patient} />
            </TabsContent>
            
            <TabsContent value="appointments">
              <PatientAppointments patientId={patient.id} />
            </TabsContent>
            
            <TabsContent value="meal-plans">
              <PatientMealPlans patientId={patient.id} />
            </TabsContent>
            
            <TabsContent value="evaluations">
              <PatientEvaluations patientId={patient.id} />
            </TabsContent>
            
            <TabsContent value="evolution">
              <PatientEvolution patientId={patient.id} />
            </TabsContent>
            
            <TabsContent value="notes">
              <PatientNotes patientId={patient.id} notes={patient.notes} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <PatientArchiveDialog 
        patient={patient}
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        onConfirm={() => handleStatusChange(patient)}
        isLoading={isLoading}
      />
    </>
  );
};

export default PatientDetailModal;
