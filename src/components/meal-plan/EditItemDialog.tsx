
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConsolidatedMealItem } from '@/types/mealPlanTypes';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ConsolidatedMealItem | null;
  onSave: (item: ConsolidatedMealItem) => void;
}

const EditItemDialog: React.FC<EditItemDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSave
}) => {
  const [formData, setFormData] = useState({
    food_name: '',
    quantity: '',
    unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        food_name: item.food_name,
        quantity: item.quantity.toString(),
        unit: item.unit,
        calories: item.calories.toString(),
        protein: item.protein.toString(),
        carbs: item.carbs.toString(),
        fats: item.fats.toString()
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;

    const updatedItem: ConsolidatedMealItem = {
      ...item,
      food_name: formData.food_name,
      quantity: parseFloat(formData.quantity) || 0,
      unit: formData.unit,
      calories: parseFloat(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fats: parseFloat(formData.fats) || 0
    };

    onSave(updatedItem);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Alimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="food_name">Nome do Alimento</Label>
              <Input
                id="food_name"
                value={formData.food_name}
                onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="calories">Calorias</Label>
              <Input
                id="calories"
                type="number"
                step="0.1"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="protein">Proteína (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carboidratos (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fats">Gorduras (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  step="0.1"
                  value={formData.fats}
                  onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
