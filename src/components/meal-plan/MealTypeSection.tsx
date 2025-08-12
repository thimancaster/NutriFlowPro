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
  items: MealPlanItem[];
  onItemsChange: (items: MealPlanItem[]) => void;
  mealPlanId: string;
}

const MealTypeSection: React.FC<MealTypeSectionProps> = ({
  mealType,
  items,
  onItemsChange,
  mealPlanId
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const calculateMealTotals = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    items.forEach(item => {
      totalCalories += item.calories * item.quantity;
      totalProtein += item.protein * item.quantity;
      totalCarbs += item.carbs * item.quantity;
      totalFats += item.fats * item.quantity;
    });

    return { totalCalories, totalProtein, totalCarbs, totalFats };
  };

  const handleItemAdd = (newItem: MealPlanItem) => {
    const updatedItems = [...items, newItem];
    onItemsChange(updatedItems);
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    onItemsChange(updatedItems);
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const { totalCalories, totalProtein, totalCarbs, totalFats } = calculateMealTotals();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{MEAL_TYPES[mealType]}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Alimento
          </Button>
        </div>
        
        <div className="text-sm mt-2">
          <span className="font-medium">Calorias:</span> {totalCalories.toFixed(0)} kcal | 
          <span className="font-medium">Proteína:</span> {totalProtein.toFixed(0)}g |
          <span className="font-medium">Carboidratos:</span> {totalCarbs.toFixed(0)}g |
          <span className="font-medium">Gorduras:</span> {totalFats.toFixed(0)}g
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="flex-1 flex items-center space-x-2">
                  <div className="w-24">
                    <Input
                      type="number"
                      value={item.quantity.toString()}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                      className="text-sm"
                    />
                  </div>
                  <div className="text-sm font-medium">{item.food_name}</div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.calories.toFixed(0)} kcal
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-sm text-gray-500 italic text-center">
                Nenhum alimento adicionado.
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
