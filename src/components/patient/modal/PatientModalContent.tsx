
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Patient } from '@/types';
import PatientBasicInfoTab from '../tabs/PatientBasicInfoTab';
import PatientAppointmentsTab from '../tabs/PatientAppointmentsTab';
import PatientEvaluationsTab from '../tabs/PatientEvaluationsTab';
import PatientEvolutionTab from '../tabs/PatientEvolutionTab';
import PatientMealPlansTab from '../tabs/PatientMealPlansTab';
import PatientNotesTab from '../tabs/PatientNotesTab';

interface PatientModalContentProps {
  patient: Patient;
  onUpdatePatient: (data: Partial<Patient>) => Promise<void>;
  onUpdateNotes: (notes: string) => Promise<void>;
}

const PatientModalContent: React.FC<PatientModalContentProps> = ({
  patient,
  onUpdatePatient,
  onUpdateNotes
}) => {
  return (
    <>
      <TabsContent value="info" className="m-0 h-full">
        <PatientBasicInfoTab patient={patient} onUpdatePatient={onUpdatePatient} />
      </TabsContent>
        
      <TabsContent value="appointments" className="m-0 h-full">
        <PatientAppointmentsTab patientId={patient.id} />
      </TabsContent>
        
      <TabsContent value="evaluations" className="m-0 h-full">
        <PatientEvaluationsTab patientId={patient.id} />
      </TabsContent>
        
      <TabsContent value="evolution" className="m-0 h-full">
        <PatientEvolutionTab patientId={patient.id} />
      </TabsContent>
        
      <TabsContent value="mealplans" className="m-0 h-full">
        <PatientMealPlansTab patientId={patient.id} />
      </TabsContent>
        
      <TabsContent value="notes" className="m-0 h-full">
        <PatientNotesTab 
          patientId={patient.id}
          content={patient.notes || ''}
          onSave={onUpdateNotes}
        />
      </TabsContent>
    </>
  );
};

export default PatientModalContent;
