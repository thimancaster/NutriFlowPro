
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MealPlanItem } from '@/types/mealPlanTypes';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: string;
  onAdd: (item: MealPlanItem) => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onOpenChange,
  mealType,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    food_name: '',
    quantity: 1,
    unit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: MealPlanItem = {
      id: crypto.randomUUID(),
      meal_id: `${mealType}-meal`,
      food_id: crypto.randomUUID(),
      food_name: formData.food_name,
      quantity: formData.quantity,
      unit: formData.unit,
      calories: formData.calories,
      protein: formData.protein,
      carbs: formData.carbs,
      fats: formData.fats,
      order_index: 0
    };
    
    onAdd(newItem);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      food_name: '',
      quantity: 1,
      unit: 'g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Alimento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="food_name">Nome do Alimento</Label>
            <Input
              id="food_name"
              value={formData.food_name}
              onChange={(e) => setFormData(prev => ({ ...prev, food_name: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calories">Calorias</Label>
              <Input
                id="calories"
                type="number"
                step="0.1"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="protein">Proteína (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={formData.protein}
                onChange={(e) => setFormData(prev => ({ ...prev, protein: Number(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="carbs">Carboidratos (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={formData.carbs}
                onChange={(e) => setFormData(prev => ({ ...prev, carbs: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="fats">Gorduras (g)</Label>
              <Input
                id="fats"
                type="number"
                step="0.1"
                value={formData.fats}
                onChange={(e) => setFormData(prev => ({ ...prev, fats: Number(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
