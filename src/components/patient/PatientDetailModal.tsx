
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
  } = usePatientModalActions(patient, onStatusChange, onClose);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    logger.info(`Changed to tab: ${value}`);
  };

  // Handle notes update
  const handleNotesUpdate = async (notes: string) => {
    try {
      await handleUpdatePatientNotes(notes);
    } catch (error) {
      logger.error('Error updating patient notes:', error);
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
                <PatientBasicInfo patient={patient} onUpdatePatient={handleUpdatePatient} />
              </TabsContent>
              
              <TabsContent value="appointments" className="m-0 h-full">
                <PatientAppointments patient={patient} />
              </TabsContent>
              
              <TabsContent value="evaluations" className="m-0 h-full">
                <PatientEvaluations patient={patient} />
              </TabsContent>
              
              <TabsContent value="evolution" className="m-0 h-full">
                <PatientEvolution patient={patient} />
              </TabsContent>
              
              <TabsContent value="mealplans" className="m-0 h-full">
                <PatientMealPlans patient={patient} />
              </TabsContent>
              
              <TabsContent value="notes" className="m-0 h-full">
                <PatientNotes 
                  initialNotes={patient.notes || ''} 
                  onSaveNotes={handleNotesUpdate} 
                />
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="px-6 py-4 border-t">
            <PatientActionButtons onClose={onClose} />
          </div>
        </DialogContent>
      </Dialog>
      
      <PatientArchiveDialog 
        isOpen={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        onArchive={handleArchivePatient}
        isArchiving={isArchiving}
        patientName={patient.name}
      />
    </>
  );
};

export default PatientDetailModal;
