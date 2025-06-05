
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DetailedMealPlan, MealPlanItem } from '@/types/mealPlan';
import MealTypeSection from './MealTypeSection';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { MealPlanService } from '@/services/mealPlanService';

interface MealPlanEditorProps {
  mealPlan: DetailedMealPlan;
  onMealPlanUpdate?: (updatedMealPlan: DetailedMealPlan) => void;
}

type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';

// Configuração das refeições em ordem cronológica correta
const MEAL_TYPE_CONFIG: Record<MealType, { name: string; time: string; color: string }> = {
  breakfast: { name: 'Café da Manhã', time: '07:00', color: 'bg-orange-100' },
  morning_snack: { name: 'Lanche da Manhã', time: '10:00', color: 'bg-yellow-100' },
  lunch: { name: 'Almoço', time: '12:30', color: 'bg-green-100' },
  afternoon_snack: { name: 'Lanche da Tarde', time: '15:30', color: 'bg-blue-100' },
  dinner: { name: 'Jantar', time: '19:00', color: 'bg-purple-100' },
  evening_snack: { name: 'Ceia', time: '21:30', color: 'bg-pink-100' }
};

// Ordem cronológica das refeições (atualizada)
const MEAL_ORDER: MealType[] = [
  'breakfast',        // Café da Manhã - 07:00
  'morning_snack',    // Lanche da Manhã - 10:00
  'lunch',            // Almoço - 12:30
  'afternoon_snack',  // Lanche da Tarde - 15:30
  'dinner',           // Jantar - 19:00
  'evening_snack'     // Ceia - 21:30
];

const MealPlanEditor: React.FC<MealPlanEditorProps> = ({ 
  mealPlan, 
  onMealPlanUpdate 
}) => {
  const [items, setItems] = useState<MealPlanItem[]>(mealPlan.items || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setItems(mealPlan.items || []);
  }, [mealPlan.items]);

  // Agrupar itens por tipo de refeição
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.meal_type]) {
      acc[item.meal_type] = [];
    }
    acc[item.meal_type].push(item);
    return acc;
  }, {} as Record<string, MealPlanItem[]>);

  const saveMealPlanChanges = async (updatedItems: MealPlanItem[]) => {
    try {
      setIsLoading(true);
      
      // Calcular novos totais
      const newTotals = updatedItems.reduce((acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fats += item.fats;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

      // Atualizar o plano alimentar
      const updatedMealPlan = {
        ...mealPlan,
        total_calories: newTotals.calories,
        total_protein: newTotals.protein,
        total_carbs: newTotals.carbs,
        total_fats: newTotals.fats,
        items: updatedItems
      };

      const result = await MealPlanService.updateMealPlan(mealPlan.id, updatedMealPlan);
      
      if (result.success && result.data) {
        toast({
          title: "Sucesso",
          description: "Plano alimentar atualizado com sucesso!",
        });
        
        if (onMealPlanUpdate) {
          onMealPlanUpdate(result.data as DetailedMealPlan);
        }
      } else {
        throw new Error(result.error || 'Erro ao salvar alterações');
      }
    } catch (error: any) {
      console.error('Erro ao salvar plano alimentar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar alterações no plano alimentar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemUpdate = async (updatedItem: MealPlanItem) => {
    console.log('Updating item:', updatedItem);
    
    const updatedItems = items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    setItems(updatedItems);
    await saveMealPlanChanges(updatedItems);
  };

  const handleItemRemove = async (itemId: string) => {
    console.log('Removing item:', itemId);
    
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    await saveMealPlanChanges(updatedItems);
  };

  const handleItemAdd = async (newItem: MealPlanItem) => {
    console.log('Adding new item:', newItem);
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    await saveMealPlanChanges(updatedItems);
  };

  // Recalcular totais baseados nos itens atuais
  const currentTotals = items.reduce((acc, item) => {
    acc.calories += item.calories;
    acc.protein += item.protein;
    acc.carbs += item.carbs;
    acc.fats += item.fats;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

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
                {currentTotals.calories.toFixed(0)} kcal
              </Badge>
              <Badge variant="outline">
                P: {currentTotals.protein.toFixed(0)}g
              </Badge>
              <Badge variant="outline">
                C: {currentTotals.carbs.toFixed(0)}g
              </Badge>
              <Badge variant="outline">
                G: {currentTotals.fats.toFixed(0)}g
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
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default MealPlanEditor;
