
import React from 'react';
import { Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PatientSelectionStepProps {
  onPatientSelected: (patient: Patient) => void;
  onCreateNew: () => void;
}

const PatientSelectionStep: React.FC<PatientSelectionStepProps> = ({
  onPatientSelected,
  onCreateNew
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seleção de Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Selecione um paciente ou crie um novo.</p>
          
          <div className="flex gap-4">
            <Button onClick={onCreateNew}>
              Novo Paciente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientSelectionStep;
