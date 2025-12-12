/**
 * MEAL PLAN PREVIEW
 * Visualização final do plano alimentar
 * 
 * FASE 2 - SPRINT U1: Refatorado para usar UnifiedNutritionContext
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUnifiedNutrition } from '@/contexts/UnifiedNutritionContext';

interface MealPlanPreviewProps {
  onEdit?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
}

const MealPlanPreview: React.FC<MealPlanPreviewProps> = ({
  onEdit,
  onSave,
  onDownload
}) => {
  const { currentPlan, activePatientData } = useUnifiedNutrition();

  if (!currentPlan || !activePatientData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum plano para visualizar
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plano Alimentar - {activePatientData.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(currentPlan.date || '').toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button onClick={onEdit} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {onDownload && (
                <Button onClick={onDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              )}
              {onSave && (
                <Button onClick={onSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo Nutricional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo Nutricional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total de Calorias</p>
              <p className="text-2xl font-bold">{Math.round(currentPlan.total_calories)} kcal</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proteína</p>
              <p className="text-2xl font-bold">{Math.round(currentPlan.total_protein)}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carboidrato</p>
              <p className="text-2xl font-bold">{Math.round(currentPlan.total_carbs)}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gordura</p>
              <p className="text-2xl font-bold">{Math.round(currentPlan.total_fats)}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refeições */}
      {currentPlan.meals.map(meal => (
        <Card key={meal.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{meal.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{meal.time}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{Math.round(meal.totalCalories)} kcal</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {meal.foods.map(food => (
              <div key={food.id} className="flex justify-between items-start p-3 border-l-4 border-primary/20 bg-muted/30 rounded">
                <div>
                  <p className="font-medium">{food.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {food.quantity}{food.unit}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{Math.round(food.calories)} kcal</p>
                  <p className="text-muted-foreground">
                    PTN: {Math.round(food.protein)}g | CHO: {Math.round(food.carbs)}g | LIP: {Math.round(food.fat)}g
                  </p>
                </div>
              </div>
            ))}
            
            {/* Totais da Refeição */}
            <div className="flex justify-between items-center pt-3 border-t font-semibold">
              <span>Total da Refeição:</span>
              <span>{Math.round(meal.totalCalories)} kcal</span>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Notas */}
      {currentPlan.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{currentPlan.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanPreview;
