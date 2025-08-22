
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsultationData } from '@/types';
import { Patient } from '@/types';

export interface MealPlanGenerationStepProps {
  patient?: Patient;
  consultationData?: ConsultationData;
  onMealPlanGenerated?: (mealPlanId: string) => void;
}

const MealPlanGenerationStep: React.FC<MealPlanGenerationStepProps> = ({
  patient,
  consultationData,
  onMealPlanGenerated
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Geração de Plano Alimentar</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Componente de geração de plano alimentar em desenvolvimento.
        </p>
        {patient && (
          <div className="mt-4">
            <p className="text-sm">
              <strong>Paciente:</strong> {patient.name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MealPlanGenerationStep;
