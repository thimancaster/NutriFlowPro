
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface EvaluationStepProps {
  patientId: string;
  onNext: () => void;
  onPrev: () => void;
}

const EvaluationStep: React.FC<EvaluationStepProps> = ({ patientId, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Avaliação Nutricional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Componente de avaliação em desenvolvimento...</p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button onClick={onNext}>
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default EvaluationStep;
