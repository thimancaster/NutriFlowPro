
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MealPlanGenerationFormProps {
  onGenerate: () => void;
}

const MealPlanGenerationForm: React.FC<MealPlanGenerationFormProps> = ({ onGenerate }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Gerar Plano Alimentar</h3>
          <p className="text-muted-foreground">
            Configure os parâmetros para gerar um novo plano alimentar.
          </p>
          <Button onClick={onGenerate} className="w-full">
            Gerar Plano Alimentar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanGenerationForm;
