
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { MealPlanItem } from '@/types/mealPlan';
import { EnhancedMealPlanService } from '@/services/mealPlanService.enhanced';
import { useDebounce } from '@/hooks/useDebounce';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: MealPlanItem['meal_type'];
  onAdd: (item: Omit<MealPlanItem, 'id' | 'created_at' | 'updated_at'>) => void;
}

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion_size: number;
  portion_unit: string;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onOpenChange,
  mealType,
  onAdd
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
      searchFoods(debouncedSearchQuery);
    } else {
      setFoods([]);
    }
  }, [debouncedSearchQuery]);

  const searchFoods = async (query: string) => {
    setIsSearching(true);
    try {
      const result = await EnhancedMealPlanService.searchFoods(query);
      if (result.success && result.data) {
        setFoods(result.data);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
      setFoods([]);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateNutrition = (food: Food, qty: number) => {
    const factor = qty / food.portion_size;
    return {
      calories: food.calories * factor,
      protein: food.protein * factor,
      carbs: food.carbs * factor,
      fats: food.fats * factor
    };
  };

  const handleAdd = () => {
    if (!selectedFood) return;

    const nutrition = calculateNutrition(selectedFood, quantity);
    const newItem: Omit<MealPlanItem, 'id' | 'created_at' | 'updated_at'> = {
      meal_plan_id: '', // Will be set by parent
      meal_type: mealType,
      food_id: selectedFood.id,
      food_name: selectedFood.name,
      quantity,
      unit: selectedFood.portion_unit,
      order_index: 0, // Will be set by parent
      ...nutrition
    };

    onAdd(newItem);
    
    // Reset form
    setSearchQuery('');
    setSelectedFood(null);
    setQuantity(100);
    setFoods([]);
  };

  const nutrition = selectedFood ? calculateNutrition(selectedFood, quantity) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Alimento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Foods */}
          <div className="space-y-2">
            <Label>Buscar Alimento</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite o nome do alimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Food Results */}
          {isSearching && (
            <div className="text-center py-4">
              <p className="text-gray-500">Buscando alimentos...</p>
            </div>
          )}

          {foods.length > 0 && (
            <div className="max-h-48 overflow-y-auto border rounded-md">
              {foods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`w-full text-left p-3 hover:bg-gray-50 border-b ${
                    selectedFood?.id === food.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="font-medium">{food.name}</div>
                  <div className="text-sm text-gray-600">
                    {food.calories} kcal por {food.portion_size} {food.portion_unit}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Food Details */}
          {selectedFood && (
            <>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium">{selectedFood.name}</h4>
                <p className="text-sm text-gray-600">
                  Porção padrão: {selectedFood.portion_size} {selectedFood.portion_unit}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantidade ({selectedFood.portion_unit})
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="0.1"
                  step="0.1"
                />
              </div>

              {nutrition && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium mb-2">
                    Valores nutricionais (quantidade selecionada):
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Calorias: {nutrition.calories.toFixed(0)} kcal</div>
                    <div>Proteínas: {nutrition.protein.toFixed(1)}g</div>
                    <div>Carboidratos: {nutrition.carbs.toFixed(1)}g</div>
                    <div>Gorduras: {nutrition.fats.toFixed(1)}g</div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={!selectedFood}
              className="flex-1"
            >
              Adicionar Alimento
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

export default AddItemDialog;
