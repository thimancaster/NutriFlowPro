
import React from 'react';
import { Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnthropometryStepProps {
  patient: Patient | null;
  onNext: () => void;
  onPrevious: () => void;
  onDataSaved: (data: any) => void;
}

const AnthropometryStep: React.FC<AnthropometryStepProps> = ({
  patient,
  onNext,
  onPrevious,
  onDataSaved
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Antropometria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Medidas antropométricas do paciente: {patient?.name}</p>
          
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

export default AnthropometryStep;
