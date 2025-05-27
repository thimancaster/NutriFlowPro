
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { EnhancedMealPlanService } from '@/services/mealPlanService.enhanced';
import { MealPlanItem } from '@/types/mealPlan';

interface FoodSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: MealPlanItem['meal_type'];
  onAddFood: (food: any, quantity: number) => void;
}

const FoodSearchDialog: React.FC<FoodSearchDialogProps> = ({
  open,
  onOpenChange,
  mealType,
  onAddFood
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [quantity, setQuantity] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      searchFoods(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, mealType]);

  const searchFoods = async (query: string) => {
    setIsLoading(true);
    try {
      const result = await EnhancedMealPlanService.searchFoods(query, mealType);
      if (result.success) {
        setSearchResults(result.data || []);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = () => {
    if (selectedFood && quantity > 0) {
      onAddFood(selectedFood, quantity);
      setSelectedFood(null);
      setQuantity(100);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const calculateNutrition = (food: any, qty: number) => {
    const factor = qty / food.portion_size;
    return {
      calories: (food.calories * factor).toFixed(0),
      protein: (food.protein * factor).toFixed(1),
      carbs: (food.carbs * factor).toFixed(1),
      fats: (food.fats * factor).toFixed(1)
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Alimento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar alimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Buscando alimentos...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2 p-4">
                {searchResults.map((food) => (
                  <div
                    key={food.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedFood?.id === food.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedFood(food)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{food.name}</div>
                        <div className="text-sm text-gray-600">
                          {food.food_group} • {food.portion_size}{food.portion_unit}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {food.calories} kcal
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhum alimento encontrado
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Digite pelo menos 2 caracteres para buscar
              </div>
            )}
          </div>

          {/* Selected Food Details */}
          {selectedFood && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">{selectedFood.name}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantidade ({selectedFood.portion_unit})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="mt-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Valores nutricionais:</strong>
                  </div>
                  {(() => {
                    const nutrition = calculateNutrition(selectedFood, quantity);
                    return (
                      <div className="text-sm space-y-1">
                        <div>Calorias: {nutrition.calories} kcal</div>
                        <div>Proteínas: {nutrition.protein}g</div>
                        <div>Carboidratos: {nutrition.carbs}g</div>
                        <div>Gorduras: {nutrition.fats}g</div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddFood} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar à refeição
                </Button>
                <Button variant="outline" onClick={() => setSelectedFood(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchDialog;
