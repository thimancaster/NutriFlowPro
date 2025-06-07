
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { FoodService, Food } from '@/services/foodService';
import { useToast } from '@/hooks/use-toast';

interface FoodSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodSelect: (food: Food) => void;
  mealType?: string;
}

const FoodSearchDialog: React.FC<FoodSearchDialogProps> = ({
  isOpen,
  onClose,
  onFoodSelect,
  mealType
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();

  const categories = [
    { value: '', label: 'Todas as categorias' },
    { value: 'proteinas', label: 'Proteínas' },
    { value: 'frutas', label: 'Frutas' },
    { value: 'cereais_e_graos', label: 'Cereais e Grãos' },
    { value: 'vegetais', label: 'Vegetais' },
    { value: 'gorduras', label: 'Gorduras' },
    { value: 'leguminosas', label: 'Leguminosas' },
    { value: 'tuberculos', label: 'Tubérculos' },
    { value: 'bebidas', label: 'Bebidas' }
  ];

  useEffect(() => {
    if (isOpen) {
      searchFoods();
    }
  }, [isOpen, searchQuery, selectedCategory, mealType]);

  const searchFoods = async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        limit: 50
      };

      if (searchQuery) {
        filters.query = searchQuery;
      }

      if (selectedCategory) {
        filters.food_group = selectedCategory;
      }

      if (mealType) {
        filters.meal_time = mealType;
      }

      const results = await FoodService.searchFoods(filters);
      setFoods(results);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar alimentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodSelect = (food: Food) => {
    onFoodSelect(food);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setFoods([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar Alimentos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filtros */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Digite o nome do alimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de Alimentos */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Buscando alimentos...
              </div>
            ) : foods.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                {searchQuery || selectedCategory ? 
                  'Nenhum alimento encontrado com os filtros aplicados' : 
                  'Digite para buscar alimentos'
                }
              </div>
            ) : (
              <div className="divide-y">
                {foods.map((food) => (
                  <div
                    key={food.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleFoodSelect(food)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{food.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {food.food_group}
                          </Badge>
                          {food.is_organic && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Orgânico
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {food.portion_size} {food.portion_unit}
                        </p>
                      </div>
                      
                      <div className="text-right text-sm">
                        <div className="font-medium">{food.calories} kcal</div>
                        <div className="text-gray-500">
                          P: {food.protein}g | C: {food.carbs}g | G: {food.fats}g
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchDialog;
