
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import { MealPlanItem } from '@/types/mealPlan';
import { EnhancedMealPlanService } from '@/services/mealPlanService.enhanced';
import { useToast } from '@/hooks/use-toast';
import EditItemDialog from './EditItemDialog';
import AddItemDialog from './AddItemDialog';

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
  const [editingItem, setEditingItem] = useState<MealPlanItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Calculate totals for this meal type
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const handleUpdateItem = async (updatedItem: MealPlanItem) => {
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
          description: "O item foi atualizado com sucesso."
        });
      } else {
        throw new Error(result.error || 'Erro ao atualizar item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o item.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const result = await EnhancedMealPlanService.removeMealPlanItem(itemId);

      if (result.success) {
        onItemRemove(itemId);
        toast({
          title: "Item removido",
          description: "O item foi removido com sucesso."
        });
      } else {
        throw new Error(result.error || 'Erro ao remover item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o item.",
        variant: "destructive"
      });
    }
  };

  const handleAddItem = async (newItem: Omit<MealPlanItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await EnhancedMealPlanService.addMealPlanItem({
        ...newItem,
        meal_plan_id: mealPlanId,
        meal_type: mealType,
        order_index: items.length
      });

      if (result.success && result.data) {
        onItemAdd(result.data);
        setShowAddDialog(false);
        toast({
          title: "Item adicionado",
          description: "O item foi adicionado com sucesso."
        });
      } else {
        throw new Error(result.error || 'Erro ao adicionar item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o item.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card className={`${config.color} border-l-4 border-l-blue-500`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle className="text-lg">{config.name}</CardTitle>
                <p className="text-sm text-gray-600">{config.time}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">
                {totals.calories.toFixed(0)} kcal
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>Nenhum alimento adicionado</p>
              <Button
                variant="ghost"
                onClick={() => setShowAddDialog(true)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro alimento
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.food_name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit} • {item.calories.toFixed(0)} kcal
                      </p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        <span>P: {item.protein.toFixed(1)}g</span>
                        <span>C: {item.carbs.toFixed(1)}g</span>
                        <span>G: {item.fats.toFixed(1)}g</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{totals.calories.toFixed(0)}</div>
                    <div className="text-gray-500">kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{totals.protein.toFixed(1)}</div>
                    <div className="text-gray-500">Prot (g)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{totals.carbs.toFixed(1)}</div>
                    <div className="text-gray-500">Carb (g)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{totals.fats.toFixed(1)}</div>
                    <div className="text-gray-500">Gord (g)</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <EditItemDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSave={handleUpdateItem}
      />

      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        mealType={mealType}
        onAdd={handleAddItem}
      />
    </>
  );
};

export default MealTypeSection;
