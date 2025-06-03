
import React, { useState, useEffect } from 'react';
import { Search, Filter, Leaf, Clock, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFoodsWithNutrition, getFoodCategories } from '@/integrations/supabase/functions';

interface FoodItem {
  id: string;
  name: string;
  food_group: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sodium?: number;
  glycemic_index?: number;
  is_organic?: boolean;
  allergens?: string[];
  cost_level?: string;
  sustainability_score?: number;
  portion_size: number;
  portion_unit: string;
}

interface EnhancedFoodSearchProps {
  onFoodSelect?: (food: FoodItem) => void;
  selectedMealTime?: string;
}

const EnhancedFoodSearch: React.FC<EnhancedFoodSearchProps> = ({
  onFoodSelect,
  selectedMealTime
}) => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isOrganic, setIsOrganic] = useState<boolean | undefined>(undefined);
  const [allergensFree, setAllergensFree] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const allergenOptions = [
    'Glúten', 'Lactose', 'Ovos', 'Soja', 'Amendoim', 
    'Castanhas', 'Peixes', 'Crustáceos'
  ];

  const mealTimeOptions = selectedMealTime ? [selectedMealTime] : [];

  useEffect(() => {
    loadCategories();
    searchFoods();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchFoods();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, isOrganic, allergensFree, selectedMealTime]);

  const loadCategories = async () => {
    try {
      const categoriesData = await getFoodCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const searchFoods = async () => {
    setLoading(true);
    try {
      const filters = {
        category: selectedCategory || undefined,
        searchTerm: searchTerm || undefined,
        mealTime: mealTimeOptions.length > 0 ? mealTimeOptions : undefined,
        isOrganic,
        allergensFree: allergensFree.length > 0 ? allergensFree : undefined
      };

      const foodsData = await getFoodsWithNutrition(filters);
      setFoods(foodsData);
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (allergen: string) => {
    setAllergensFree(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const getCostLevelColor = (level?: string) => {
    switch (level) {
      case 'baixo': return 'text-green-600';
      case 'medio': return 'text-yellow-600';
      case 'alto': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar alimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Organic Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="organic"
                checked={isOrganic === true}
                onCheckedChange={(checked) => 
                  setIsOrganic(checked ? true : undefined)
                }
              />
              <Label htmlFor="organic" className="flex items-center gap-1">
                <Leaf className="h-4 w-4 text-green-600" />
                Apenas alimentos orgânicos
              </Label>
            </div>

            {/* Allergen Free Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Livre de alérgenos
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {allergenOptions.map((allergen) => (
                  <div key={allergen} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergen}
                      checked={allergensFree.includes(allergen)}
                      onCheckedChange={() => toggleAllergen(allergen)}
                    />
                    <Label htmlFor={allergen} className="text-sm">
                      {allergen}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {foods.map((food) => (
            <Card
              key={food.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onFoodSelect?.(food)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{food.name}</h3>
                      {food.is_organic && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Leaf className="h-3 w-3 mr-1" />
                          Orgânico
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {food.portion_size}{food.portion_unit} • {food.food_group}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Calorias:</span>
                        <div className="font-medium">{food.calories}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Proteína:</span>
                        <div className="font-medium text-red-600">{food.protein}g</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Carbos:</span>
                        <div className="font-medium text-yellow-600">{food.carbs}g</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Gorduras:</span>
                        <div className="font-medium text-green-600">{food.fats}g</div>
                      </div>
                    </div>

                    {(food.fiber || food.sodium || food.glycemic_index) && (
                      <div className="mt-2 flex gap-4 text-xs text-gray-500">
                        {food.fiber && <span>Fibra: {food.fiber}g</span>}
                        {food.sodium && <span>Sódio: {food.sodium}mg</span>}
                        {food.glycemic_index && <span>IG: {food.glycemic_index}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {food.cost_level && (
                      <div className={`flex items-center gap-1 text-xs ${getCostLevelColor(food.cost_level)}`}>
                        <DollarSign className="h-3 w-3" />
                        {food.cost_level}
                      </div>
                    )}
                    
                    {food.sustainability_score && (
                      <div className="text-xs text-green-600">
                        Sustentabilidade: {food.sustainability_score}/10
                      </div>
                    )}

                    {food.allergens && food.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-w-32">
                        {food.allergens.map((allergen) => (
                          <Badge key={allergen} variant="secondary" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {foods.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Nenhum alimento encontrado com os filtros aplicados.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedFoodSearch;
