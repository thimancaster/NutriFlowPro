
import React from 'react';
import { Patient } from '@/types';
import { ConsultationData } from '@/types/consultation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MealPlanStepProps {
  patient: Patient | null;
  consultation: ConsultationData | null;
  onNext: () => void;
  onPrevious: () => void;
  onMealPlanSaved: (mealPlanData: any) => void;
}

const MealPlanStep: React.FC<MealPlanStepProps> = ({
  patient,
  consultation,
  onNext,
  onPrevious,
  onMealPlanSaved
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plano Alimentar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Plano alimentar para: {patient?.name}</p>
          
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

export default MealPlanStep;
