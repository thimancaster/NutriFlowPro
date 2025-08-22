
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConsolidatedMealPlanEditorProps {
  mealPlan: ConsolidatedMealPlan;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female';
}

const ConsolidatedMealPlanEditor: React.FC<ConsolidatedMealPlanEditorProps> = ({
  mealPlan,
  patientName = 'Paciente',
  patientAge,
  patientGender
}) => {
  return (
    <div className="space-y-6">
      {/* Cabeçalho do Plano */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🇧🇷 Editor do Plano Alimentar - {patientName}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{mealPlan.total_calories.toFixed(0)} kcal</Badge>
              <Badge variant="outline">P: {mealPlan.total_protein.toFixed(0)}g</Badge>
              <Badge variant="outline">C: {mealPlan.total_carbs.toFixed(0)}g</Badge>
              <Badge variant="outline">G: {mealPlan.total_fats.toFixed(0)}g</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Data: {format(new Date(mealPlan.date), "dd/MM/yyyy", { locale: ptBR })}
            {patientAge && ` • Idade: ${patientAge} anos`}
            {patientGender && ` • ${patientGender === 'male' ? 'Masculino' : 'Feminino'}`}
          </p>
        </CardHeader>
      </Card>

      {/* Refeições */}
      <div className="grid gap-6">
        {mealPlan.meals.map((meal) => (
          <Card key={meal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {meal.name} {meal.time && `(${meal.time})`}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">{meal.total_calories.toFixed(0)} kcal</Badge>
                  <Badge variant="outline">P: {meal.total_protein.toFixed(0)}g</Badge>
                  <Badge variant="outline">C: {meal.total_carbs.toFixed(0)}g</Badge>
                  <Badge variant="outline">G: {meal.total_fats.toFixed(0)}g</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {meal.items.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{item.food_name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {item.quantity}{item.unit}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span>{item.calories.toFixed(0)} kcal</span>
                      <span>P: {item.protein.toFixed(0)}g</span>
                      <span>C: {item.carbs.toFixed(0)}g</span>
                      <span>G: {item.fats.toFixed(0)}g</span>
                    </div>
                  </div>
                ))}
                
                {meal.items.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum item nesta refeição
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConsolidatedMealPlanEditor;
