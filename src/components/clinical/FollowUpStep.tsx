
import React from 'react';
import { Patient } from '@/types';
import { ConsultationData } from '@/types/consultation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FollowUpStepProps {
  patient: Patient | null;
  consultation: ConsultationData | null;
  onComplete: () => void;
  onPrevious: () => void;
}

const FollowUpStep: React.FC<FollowUpStepProps> = ({
  patient,
  consultation,
  onComplete,
  onPrevious
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acompanhamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Finalize a consulta e defina o próximo acompanhamento.</p>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrevious}>
              Anterior
            </Button>
            <Button onClick={onComplete}>
              Finalizar Consulta
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpStep;
