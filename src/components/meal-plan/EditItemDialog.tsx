
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MealPlanItem } from '@/types/mealPlan';
import { FoodService } from '@/services/foodService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calculator } from 'lucide-react';

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
  const [unit, setUnit] = useState('g');
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setUnit(item.unit);
      calculateNutrition(item.quantity);
    }
  }, [item]);

  const calculateNutrition = async (newQuantity: number) => {
    if (!item || !item.food_id) {
      // Se não há food_id, usar proporção baseada nos valores atuais
      if (item && item.quantity > 0) {
        const factor = newQuantity / item.quantity;
        setCalculatedNutrition({
          calories: Math.round(item.calories * factor * 10) / 10,
          protein: Math.round(item.protein * factor * 10) / 10,
          carbs: Math.round(item.carbs * factor * 10) / 10,
          fats: Math.round(item.fats * factor * 10) / 10
        });
      }
      return;
    }

    try {
      // Buscar dados originais do alimento
      const food = await FoodService.getFoodById(item.food_id);
      if (food) {
        const nutrition = FoodService.calculateNutrition(food, newQuantity);
        setCalculatedNutrition(nutrition);
      }
    } catch (error) {
      console.error('Erro ao calcular nutrição:', error);
      // Fallback para cálculo proporcional
      if (item.quantity > 0) {
        const factor = newQuantity / item.quantity;
        setCalculatedNutrition({
          calories: Math.round(item.calories * factor * 10) / 10,
          protein: Math.round(item.protein * factor * 10) / 10,
          carbs: Math.round(item.carbs * factor * 10) / 10,
          fats: Math.round(item.fats * factor * 10) / 10
        });
      }
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    calculateNutrition(newQuantity);
  };

  const handleSave = async () => {
    if (!item || quantity <= 0) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const updatedItem: MealPlanItem = {
        ...item,
        quantity,
        unit,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fats: calculatedNutrition.fats
      };

      onSave(updatedItem);
      
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Editar Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-lg">{item.food_name}</h4>
            <p className="text-sm text-gray-600">
              Unidade original: {item.unit}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-quantity">Quantidade</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                min="0.1"
                step="0.1"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-unit">Unidade</Label>
              <Input
                id="edit-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="text-sm font-medium mb-3 text-blue-900">
              Valores nutricionais calculados:
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold text-lg text-blue-600">
                  {calculatedNutrition.calories.toFixed(0)}
                </div>
                <div className="text-gray-600">kcal</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold text-lg text-red-600">
                  {calculatedNutrition.protein.toFixed(1)}g
                </div>
                <div className="text-gray-600">Proteínas</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold text-lg text-yellow-600">
                  {calculatedNutrition.carbs.toFixed(1)}g
                </div>
                <div className="text-gray-600">Carboidratos</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold text-lg text-green-600">
                  {calculatedNutrition.fats.toFixed(1)}g
                </div>
                <div className="text-gray-600">Gorduras</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSave} 
              className="flex-1" 
              disabled={isLoading || quantity <= 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
