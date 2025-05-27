
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit3, Search } from 'lucide-react';
import { MealPlanItem } from '@/types/mealPlan';
import { EnhancedMealPlanService } from '@/services/mealPlanService.enhanced';
import { useToast } from '@/hooks/use-toast';
import FoodSearchDialog from './FoodSearchDialog';
import EditItemDialog from './EditItemDialog';

interface MealTypeSectionProps {
  mealType: MealPlanItem['meal_type'];
  config: {
    name: string;
    time: string;
    color: string;
  };
  items: MealPlanItem[];
  mealPlanId: string;
  onItemUpdate: (item: MealPlanItem) => void;
  onItemRemove: (itemId: string) => void;
  onItemAdd: (item: MealPlanItem) => void;
}

const MealTypeSection: React.FC<MealTypeSectionProps> = ({
  mealType,
  config,
  items,
  mealPlanId,
  onItemUpdate,
  onItemRemove,
  onItemAdd
}) => {
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [editingItem, setEditingItem] = useState<MealPlanItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calcular totais da refeição
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const handleRemoveItem = async (item: MealPlanItem) => {
    setIsLoading(true);
    try {
      const result = await EnhancedMealPlanService.removeMealPlanItem(item.id);
      
      if (result.success) {
        onItemRemove(item.id);
        toast({
          title: "Item removido",
          description: `${item.food_name} foi removido da refeição.`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = async (food: any, quantity: number) => {
    setIsLoading(true);
    try {
      // Calcular valores nutricionais baseados na quantidade
      const factor = quantity / food.portion_size;
      const newItem = {
        meal_plan_id: mealPlanId,
        meal_type: mealType,
        food_id: food.id,
        food_name: food.name,
        quantity,
        unit: food.portion_unit,
        calories: food.calories * factor,
        protein: food.protein * factor,
        carbs: food.carbs * factor,
        fats: food.fats * factor,
        order_index: items.length
      };

      const result = await EnhancedMealPlanService.addMealPlanItem(newItem);
      
      if (result.success && result.data) {
        onItemAdd(result.data);
        setShowFoodSearch(false);
        toast({
          title: "Alimento adicionado",
          description: `${food.name} foi adicionado à ${config.name.toLowerCase()}.`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar alimento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (updatedItem: MealPlanItem) => {
    setIsLoading(true);
    try {
      const result = await EnhancedMealPlanService.updateMealPlanItem(
        updatedItem.id,
        {
          quantity: updatedItem.quantity,
          calories: updatedItem.calories,
          protein: updatedItem.protein,
          carbs: updatedItem.carbs,
          fats: updatedItem.fats
        }
      );
      
      if (result.success && result.data) {
        onItemUpdate(result.data);
        setEditingItem(null);
        toast({
          title: "Item atualizado",
          description: `${updatedItem.food_name} foi atualizado.`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className={`border-l-4 ${config.color}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {config.name}
                <Badge variant="secondary">{config.time}</Badge>
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">
                  {totals.calories.toFixed(0)} kcal
                </Badge>
                <Badge variant="outline">
                  P: {totals.protein.toFixed(0)}g
                </Badge>
                <Badge variant="outline">
                  C: {totals.carbs.toFixed(0)}g
                </Badge>
                <Badge variant="outline">
                  G: {totals.fats.toFixed(0)}g
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFoodSearch(true)}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum alimento adicionado ainda.</p>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => setShowFoodSearch(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar alimentos
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.food_name}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity.toFixed(0)}{item.unit} • {item.calories.toFixed(0)} kcal
                      <span className="ml-2">
                        P: {item.protein.toFixed(0)}g | 
                        C: {item.carbs.toFixed(0)}g | 
                        G: {item.fats.toFixed(0)}g
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                      disabled={isLoading}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FoodSearchDialog
        open={showFoodSearch}
        onOpenChange={setShowFoodSearch}
        mealType={mealType}
        onAddFood={handleAddFood}
      />

      <EditItemDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSave={handleUpdateItem}
      />
    </>
  );
};

export default MealTypeSection;
