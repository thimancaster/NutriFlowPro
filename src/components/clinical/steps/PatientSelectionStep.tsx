/**
 * Patient Selection Step for Clinical Workflow
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useClinicalWorkflow } from '@/contexts/ClinicalWorkflowContext';
import { User } from 'lucide-react';

export const PatientSelectionStep: React.FC = () => {
  const { patients, isLoading } = usePatient();
  const { startSession } = useClinicalWorkflow();
  
  const handleSelectPatient = async (patient: any) => {
    await startSession(patient);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione um Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Carregando pacientes...</p>
        ) : (
          <div className="space-y-2">
            {patients.map((patient) => (
              <Button
                key={patient.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSelectPatient(patient)}
              >
                <User className="mr-2 h-4 w-4" />
                {patient.name}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSelectionStep;
