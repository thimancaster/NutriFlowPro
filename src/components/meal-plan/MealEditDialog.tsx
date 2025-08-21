
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { ConsolidatedMeal, ConsolidatedMealItem } from '@/types/mealPlanTypes';
import { useToast } from '@/hooks/use-toast';
import FoodSearchDialog from './FoodSearchDialog';

interface MealEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: ConsolidatedMeal | null;
  onSave: (updatedMeal: ConsolidatedMeal) => void;
}

const MealEditDialog: React.FC<MealEditDialogProps> = ({
  open,
  onOpenChange,
  meal,
  onSave
}) => {
  const [editedMeal, setEditedMeal] = useState<ConsolidatedMeal | null>(null);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (meal) {
      setEditedMeal({ ...meal });
    }
  }, [meal]);

  const calculateMealTotals = (items: ConsolidatedMealItem[]) => {
    return items.reduce(
      (totals, item) => ({
        calories: totals.calories + item.calories,
        protein: totals.protein + item.protein,
        carbs: totals.carbs + item.carbs,
        fats: totals.fats + item.fats
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const handleItemQuantityChange = (itemIndex: number, newQuantity: number) => {
    if (!editedMeal) return;

    const updatedItems = [...editedMeal.items];
    const item = updatedItems[itemIndex];
    const originalQuantity = item.quantity;
    
    if (originalQuantity > 0) {
      const factor = newQuantity / originalQuantity;
      updatedItems[itemIndex] = {
        ...item,
        quantity: newQuantity,
        calories: Math.round(item.calories / originalQuantity * newQuantity * 10) / 10,
        protein: Math.round(item.protein / originalQuantity * newQuantity * 10) / 10,
        carbs: Math.round(item.carbs / originalQuantity * newQuantity * 10) / 10,
        fats: Math.round(item.fats / originalQuantity * newQuantity * 10) / 10
      };
    }

    const totals = calculateMealTotals(updatedItems);
    
    setEditedMeal({
      ...editedMeal,
      items: updatedItems,
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fats: totals.fats
    });
  };

  const handleRemoveItem = (itemIndex: number) => {
    if (!editedMeal) return;

    const updatedItems = editedMeal.items.filter((_, index) => index !== itemIndex);
    const totals = calculateMealTotals(updatedItems);
    
    setEditedMeal({
      ...editedMeal,
      items: updatedItems,
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fats: totals.fats
    });
  };

  const handleAddFood = (food: any) => {
    if (!editedMeal) return;

    const newItem: ConsolidatedMealItem = {
      id: crypto.randomUUID(),
      food_id: food.id,
      food_name: food.name,
      quantity: food.portion_size || 100,
      unit: food.portion_unit || 'g',
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0,
      order_index: editedMeal.items.length
    };

    const updatedItems = [...editedMeal.items, newItem];
    const totals = calculateMealTotals(updatedItems);
    
    setEditedMeal({
      ...editedMeal,
      items: updatedItems,
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fats: totals.fats
    });

    setShowFoodSearch(false);
  };

  const handleSave = async () => {
    if (!editedMeal) return;

    setIsSaving(true);
    try {
      onSave(editedMeal);
      toast({
        title: "Sucesso",
        description: "Refeição atualizada com sucesso!",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar a refeição",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!editedMeal) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar {editedMeal.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Resumo Nutricional */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Resumo Nutricional</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(editedMeal.total_calories)}
                  </div>
                  <div className="text-sm text-gray-600">kcal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.round(editedMeal.total_protein)}g
                  </div>
                  <div className="text-sm text-gray-600">Proteína</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(editedMeal.total_carbs)}g
                  </div>
                  <div className="text-sm text-gray-600">Carboidratos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(editedMeal.total_fats)}g
                  </div>
                  <div className="text-sm text-gray-600">Gorduras</div>
                </div>
              </div>
            </div>

            {/* Lista de Alimentos */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Alimentos da Refeição</h3>
                <Button onClick={() => setShowFoodSearch(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Alimento
                </Button>
              </div>

              {editedMeal.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum alimento adicionado ainda</p>
                  <Button 
                    onClick={() => setShowFoodSearch(true)} 
                    variant="outline" 
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Primeiro Alimento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {editedMeal.items.map((item, index) => (
                    <div key={item.id || index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.food_name}</h4>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <Label htmlFor={`quantity-${index}`}>Quantidade</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  id={`quantity-${index}`}
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleItemQuantityChange(index, Number(e.target.value))}
                                  min="0.1"
                                  step="0.1"
                                  className="w-24"
                                />
                                <span className="flex items-center text-sm text-gray-600">
                                  {item.unit}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {Math.round(item.calories)} kcal
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                P: {Math.round(item.protein)}g
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                C: {Math.round(item.carbs)}g
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                G: {Math.round(item.fats)}g
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-dashed border-current" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FoodSearchDialog
        isOpen={showFoodSearch}
        onClose={() => setShowFoodSearch(false)}
        onFoodSelect={handleAddFood}
      />
    </>
  );
};

export default MealEditDialog;
