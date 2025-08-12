
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MealType, MEAL_TYPES, MealPlanItem } from '@/types/mealPlan';
import { useToast } from '@/hooks/use-toast';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlanId: string;
  onItemAdd: (item: MealPlanItem) => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onOpenChange,
  mealPlanId,
  onItemAdd
}) => {
  const [formData, setFormData] = useState({
    meal_type: 'cafe_da_manha' as MealType,
    food_name: '',
    quantity: 100,
    unit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: MealPlanItem = {
      id: crypto.randomUUID(),
      meal_plan_id: mealPlanId,
      meal_type: formData.meal_type,
      food_name: formData.food_name,
      quantity: formData.quantity,
      unit: formData.unit,
      calories: formData.calories,
      protein: formData.protein,
      carbs: formData.carbs,
      fats: formData.fats,
      order_index: 0
    };

    onItemAdd(newItem);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      meal_type: 'cafe_da_manha' as MealType,
      food_name: '',
      quantity: 100,
      unit: 'g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    });

    toast({
      title: "Sucesso",
      description: "Item adicionado com sucesso!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Alimento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Refeição</Label>
            <Select value={formData.meal_type} onValueChange={(value: MealType) => setFormData({...formData, meal_type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEAL_TYPES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nome do Alimento</Label>
            <Input
              value={formData.food_name}
              onChange={(e) => setFormData({...formData, food_name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <Label>Unidade</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Calorias</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.calories}
                onChange={(e) => setFormData({...formData, calories: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <Label>Proteína (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.protein}
                onChange={(e) => setFormData({...formData, protein: Number(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Carboidratos (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.carbs}
                onChange={(e) => setFormData({...formData, carbs: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <Label>Gorduras (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.fats}
                onChange={(e) => setFormData({...formData, fats: Number(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
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
