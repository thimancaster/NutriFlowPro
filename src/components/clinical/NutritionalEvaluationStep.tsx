
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NutritionalData {
  activityLevel: string;
  bodyType: string;
  tmb: number;
  get: number;
  vet: number;
  calories: number;
  protein: number;
  carbs: number;
}

interface NutritionalEvaluationStepProps {
  data: NutritionalData;
  onDataChange: (data: Partial<NutritionalData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const NutritionalEvaluationStep: React.FC<NutritionalEvaluationStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliação Nutricional</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Avaliação nutricional do paciente</p>
          
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

export default NutritionalEvaluationStep;
