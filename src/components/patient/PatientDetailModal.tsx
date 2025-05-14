
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PatientModalHeader from './modal/PatientModalHeader';
import PatientTabNavigation from './modal/PatientTabNavigation';
import PatientBasicInfo from './PatientBasicInfo';
import PatientAppointments from './PatientAppointments';
import PatientEvaluations from './PatientEvaluations';
import PatientNotes from './PatientNotes';
import PatientEvolution from './PatientEvolution';
import PatientMealPlans from './PatientMealPlans';
import PatientArchiveDialog from './modal/PatientArchiveDialog';
import PatientActionButtons from './modal/PatientActionButtons';
import { Patient } from '@/types';
import { usePatientModalActions } from '@/hooks/patient/usePatientModalActions';
import { logger } from '@/utils/logger';

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
  const [activeTab, setActiveTab] = useState('info');
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  
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

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    logger.info(`Changed to tab: ${value}`);
  };

  // Fix the Promise<void> return type issue
  const handlePatientUpdate = async (updatedData: Partial<Patient>): Promise<void> => {
    try {
      await handleUpdatePatient(updatedData);
      // No need to return anything, just awaiting the promise
    } catch (error) {
      logger.error('Error updating patient:', error);
      // Still returning void (undefined)
    }
  };

  // Handle notes update with void return type
  const handleNotesUpdate = async (notes: string): Promise<void> => {
    try {
      await handleUpdatePatientNotes(notes);
      // No return value needed
    } catch (error) {
      logger.error('Error updating patient notes:', error);
      // Still returning void (undefined)
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 h-[85vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <PatientModalHeader 
              patient={patient}
              onArchive={() => setShowArchiveDialog(true)}
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
              <TabsContent value="info" className="m-0 h-full">
                <PatientBasicInfo patient={patient} onUpdatePatient={handlePatientUpdate} />
              </TabsContent>
              
              <TabsContent value="appointments" className="m-0 h-full">
                <PatientAppointments patientId={patient.id} />
              </TabsContent>
              
              <TabsContent value="evaluations" className="m-0 h-full">
                <PatientEvaluations patientId={patient.id} />
              </TabsContent>
              
              <TabsContent value="evolution" className="m-0 h-full">
                <PatientEvolution patientId={patient.id} />
              </TabsContent>
              
              <TabsContent value="mealplans" className="m-0 h-full">
                <PatientMealPlans patientId={patient.id} />
              </TabsContent>
              
              <TabsContent value="notes" className="m-0 h-full">
                <PatientNotes 
                  patientId={patient.id}
                  content={patient.notes || ''}
                  onSave={handleNotesUpdate}
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
        onClose={() => setShowArchiveDialog(false)}
        onArchive={handleArchivePatient}
        isArchiving={isArchiving}
        patientName={patient.name}
      />
    </>
  );
};

export default PatientDetailModal;
