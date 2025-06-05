
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DetailedMealPlan, MealPlanItem } from '@/types/mealPlan';
import MealTypeSection from './MealTypeSection';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealPlanEditorProps {
  mealPlan: DetailedMealPlan;
}

type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';

// Configuração das refeições em ordem cronológica
const MEAL_TYPE_CONFIG: Record<MealType, { name: string; time: string; color: string }> = {
  breakfast: { name: 'Café da Manhã', time: '07:00', color: 'bg-orange-100' },
  morning_snack: { name: 'Lanche da Manhã', time: '10:00', color: 'bg-yellow-100' },
  lunch: { name: 'Almoço', time: '12:30', color: 'bg-green-100' },
  afternoon_snack: { name: 'Lanche da Tarde', time: '15:30', color: 'bg-blue-100' },
  dinner: { name: 'Jantar', time: '19:00', color: 'bg-purple-100' },
  evening_snack: { name: 'Ceia', time: '21:30', color: 'bg-pink-100' }
};

// Ordem cronológica das refeições
const MEAL_ORDER: MealType[] = [
  'breakfast',
  'morning_snack', 
  'lunch',
  'afternoon_snack',
  'dinner',
  'evening_snack'
];

const MealPlanEditor: React.FC<MealPlanEditorProps> = ({ mealPlan }) => {
  const [items, setItems] = useState<MealPlanItem[]>(mealPlan.items || []);

  // Agrupar itens por tipo de refeição
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.meal_type]) {
      acc[item.meal_type] = [];
    }
    acc[item.meal_type].push(item);
    return acc;
  }, {} as Record<string, MealPlanItem[]>);

  const handleItemUpdate = (updatedItem: MealPlanItem) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleItemRemove = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleItemAdd = (newItem: MealPlanItem) => {
    setItems(prev => [...prev, newItem]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Plano Alimentar - {format(new Date(mealPlan.date), 'dd/MM/yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {mealPlan.total_calories.toFixed(0)} kcal
              </Badge>
              <Badge variant="outline">
                P: {mealPlan.total_protein.toFixed(0)}g
              </Badge>
              <Badge variant="outline">
                C: {mealPlan.total_carbs.toFixed(0)}g
              </Badge>
              <Badge variant="outline">
                G: {mealPlan.total_fats.toFixed(0)}g
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {MEAL_ORDER.map((mealType) => (
          <MealTypeSection
            key={mealType}
            mealType={mealType}
            config={MEAL_TYPE_CONFIG[mealType]}
            items={groupedItems[mealType] || []}
            mealPlanId={mealPlan.id}
            onItemUpdate={handleItemUpdate}
            onItemRemove={handleItemRemove}
            onItemAdd={handleItemAdd}
          />
        ))}
      </div>
    </div>
  );
};

export default MealPlanEditor;
