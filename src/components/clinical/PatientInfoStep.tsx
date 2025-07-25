
import React from 'react';
import { Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PatientInfoStepProps {
  patient: Patient | null;
  onNext: () => void;
  onPrevious: () => void;
  onUpdatePatient: (patientData: Partial<Patient>) => void;
}

const PatientInfoStep: React.FC<PatientInfoStepProps> = ({
  patient,
  onNext,
  onPrevious,
  onUpdatePatient
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Informações básicas do paciente: {patient?.name}</p>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrevious}>
              Anterior
            </Button>
            <Button onClick={onNext}>
              Próximo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoStep;
