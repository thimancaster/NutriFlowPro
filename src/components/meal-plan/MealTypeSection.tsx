
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { MEAL_TYPES, MealType, MealPlanItem } from '@/types/mealPlan';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import AddItemDialog from './AddItemDialog';

interface MealTypeSectionProps {
  mealType: MealType;
  config: {
    name: string;
    time: string;
    color: string;
  };
  items: MealPlanItem[];
  mealPlanId: string;
  onItemUpdate: (updatedItem: MealPlanItem) => Promise<void>;
  onItemRemove: (itemId: string) => Promise<void>;
  onItemAdd: (newItem: MealPlanItem) => Promise<void>;
  isLoading: boolean;
}

const MealTypeSection: React.FC<MealTypeSectionProps> = ({
  mealType,
  config,
  items,
  mealPlanId,
  onItemUpdate,
  onItemRemove,
  onItemAdd,
  isLoading
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const calculateMealTotals = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    items.forEach(item => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFats += item.fats;
    });

    return { totalCalories, totalProtein, totalCarbs, totalFats };
  };

  const handleItemUpdate = async (updatedItem: MealPlanItem) => {
    await onItemUpdate(updatedItem);
  };

  const handleItemRemove = async (itemId: string) => {
    await onItemRemove(itemId);
  };

  const handleItemAdd = async (newItem: MealPlanItem) => {
    await onItemAdd(newItem);
    setIsAddDialogOpen(false);
  };

  const handleItemChange = async (id: string, field: string, value: any) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const updatedItem = { ...item, [field]: value };
      await handleItemUpdate(updatedItem);
    }
  };

  const { totalCalories, totalProtein, totalCarbs, totalFats } = calculateMealTotals();

  return (
    <Card className={`mb-4 ${config.color}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            {config.name}
            <span className="text-sm font-normal text-gray-500">{config.time}</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Adicionar Alimento
          </Button>
        </div>
        
        <div className="text-sm mt-2 flex gap-4">
          <Badge variant="outline">
            {totalCalories.toFixed(0)} kcal
          </Badge>
          <Badge variant="outline">
            P: {totalProtein.toFixed(0)}g
          </Badge>
          <Badge variant="outline">
            C: {totalCarbs.toFixed(0)}g
          </Badge>
          <Badge variant="outline">
            G: {totalFats.toFixed(0)}g
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="flex-1 flex items-center space-x-3">
                  <div className="w-20">
                    <Input
                      type="number"
                      value={item.quantity.toString()}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="text-sm"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.food_name}</div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.calories.toFixed(0)} kcal
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleItemRemove(item.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-sm text-gray-500 italic text-center py-8">
                Nenhum alimento adicionado para {config.name.toLowerCase()}.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <AddItemDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        mealType={mealType}
        mealPlanId={mealPlanId}
        onItemAdd={handleItemAdd}
      />
    </Card>
  );
};

export default MealTypeSection;
