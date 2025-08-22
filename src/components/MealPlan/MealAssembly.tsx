
import React from 'react';
import { ConsolidatedMealPlan, MealPlanGenerationParams } from '@/types/mealPlanTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils } from 'lucide-react';

interface MealAssemblyProps {
  mealPlan?: ConsolidatedMealPlan;
  onGenerate?: (params: MealPlanGenerationParams) => void;
  onEdit?: (mealPlan: ConsolidatedMealPlan) => void;
}

const MealAssembly: React.FC<MealAssemblyProps> = ({
  mealPlan,
  onGenerate,
  onEdit
}) => {
  const handleGenerateMealPlan = () => {
    if (onGenerate && mealPlan) {
      // Convert ConsolidatedMealPlan to MealPlanGenerationParams
      const params: MealPlanGenerationParams = {
        userId: mealPlan.user_id,
        patientId: mealPlan.patient_id,
        calculationId: mealPlan.calculation_id,
        totalCalories: mealPlan.total_calories,
        totalProtein: mealPlan.total_protein,
        totalCarbs: mealPlan.total_carbs,
        totalFats: mealPlan.total_fats,
        targets: {
          kcal: mealPlan.total_calories,
          protein_g: mealPlan.total_protein,
          carb_g: mealPlan.total_carbs,
          fat_g: mealPlan.total_fats
        }
      };
      onGenerate(params);
    }
  };

  const handleEditMealPlan = () => {
    if (onEdit && mealPlan) {
      onEdit(mealPlan);
    }
  };

  if (!mealPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Plano Alimentar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Nenhum plano alimentar disponível. Gere um novo plano.
          </p>
          <Button onClick={handleGenerateMealPlan} disabled={!onGenerate}>
            Gerar Plano Alimentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Plano Alimentar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(mealPlan.total_calories)}</p>
              <p className="text-sm text-muted-foreground">kcal</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(mealPlan.total_protein)}g</p>
              <p className="text-sm text-muted-foreground">Proteína</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(mealPlan.total_carbs)}g</p>
              <p className="text-sm text-muted-foreground">Carboidratos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(mealPlan.total_fats)}g</p>
              <p className="text-sm text-muted-foreground">Gorduras</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleEditMealPlan} disabled={!onEdit}>
              Editar Plano
            </Button>
            <Button variant="outline" onClick={handleGenerateMealPlan} disabled={!onGenerate}>
              Gerar Novo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealAssembly;
