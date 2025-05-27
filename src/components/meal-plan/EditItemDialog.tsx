
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MealPlanItem } from '@/types/mealPlan';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MealPlanItem | null;
  onSave: (item: MealPlanItem) => void;
}

const EditItemDialog: React.FC<EditItemDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSave
}) => {
  const [quantity, setQuantity] = useState(0);
  const [originalItem, setOriginalItem] = useState<MealPlanItem | null>(null);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setOriginalItem(item);
    }
  }, [item]);

  const calculateNutrition = (newQuantity: number) => {
    if (!originalItem) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    const factor = newQuantity / originalItem.quantity;
    return {
      calories: originalItem.calories * factor,
      protein: originalItem.protein * factor,
      carbs: originalItem.carbs * factor,
      fats: originalItem.fats * factor
    };
  };

  const handleSave = () => {
    if (!originalItem) return;

    const nutrition = calculateNutrition(quantity);
    const updatedItem: MealPlanItem = {
      ...originalItem,
      quantity,
      ...nutrition
    };

    onSave(updatedItem);
  };

  if (!item) return null;

  const nutrition = calculateNutrition(quantity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{item.food_name}</h4>
            <p className="text-sm text-gray-600">
              Unidade: {item.unit}
            </p>
          </div>

          <div>
            <Label htmlFor="edit-quantity">Quantidade ({item.unit})</Label>
            <Input
              id="edit-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="0.1"
              step="0.1"
              className="mt-1"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium mb-2">
              Valores nutricionais (quantidade atual):
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Calorias: {nutrition.calories.toFixed(0)} kcal</div>
              <div>Proteínas: {nutrition.protein.toFixed(1)}g</div>
              <div>Carboidratos: {nutrition.carbs.toFixed(1)}g</div>
              <div>Gorduras: {nutrition.fats.toFixed(1)}g</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Salvar Alterações
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
