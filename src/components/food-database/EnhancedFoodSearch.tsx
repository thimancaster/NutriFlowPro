
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, X, Leaf, Clock, Award } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getFoodsWithNutrition, getFoodCategories } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';

interface EnhancedFoodSearchProps {
  onFoodSelect: (food: any) => void;
}

const EnhancedFoodSearch: React.FC<EnhancedFoodSearchProps> = ({ onFoodSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    mealTime: [] as string[],
    isOrganic: false,
    maxCalories: '',
    minProtein: '',
    allergensFree: [] as string[]
  });
  const { toast } = useToast();

  const mealTimes = [
    { value: 'breakfast', label: 'Café da Manhã' },
    { value: 'morning_snack', label: 'Lanche da Manhã' },
    { value: 'lunch', label: 'Almoço' },
    { value: 'afternoon_snack', label: 'Lanche da Tarde' },
    { value: 'dinner', label: 'Jantar' },
    { value: 'evening_snack', label: 'Ceia' }
  ];

  const allergens = [
    'gluten', 'lactose', 'soja', 'ovos', 'amendoim', 'frutos do mar', 'nozes'
  ];

  useEffect(() => {
    loadCategories();
    searchFoods();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFoods();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]);

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
      const searchFilters = {
        searchTerm: searchTerm.trim(),
        category: filters.category || undefined,
        mealTime: filters.mealTime.length > 0 ? filters.mealTime : undefined,
        isOrganic: filters.isOrganic || undefined,
        allergensFree: filters.allergensFree.length > 0 ? filters.allergensFree : undefined
      };

      let foodsData = await getFoodsWithNutrition(searchFilters);

      // Apply additional filters
      if (filters.maxCalories) {
        foodsData = foodsData.filter(food => food.calories <= parseFloat(filters.maxCalories));
      }
      if (filters.minProtein) {
        foodsData = foodsData.filter(food => food.protein >= parseFloat(filters.minProtein));
      }

      setFoods(foodsData);
    } catch (error) {
      console.error('Error searching foods:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar alimentos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      mealTime: [],
      isOrganic: false,
      maxCalories: '',
      minProtein: '',
      allergensFree: []
    });
  };

  const handleMealTimeChange = (mealTime: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      mealTime: checked 
        ? [...prev.mealTime, mealTime]
        : prev.mealTime.filter(mt => mt !== mealTime)
    }));
  };

  const handleAllergenChange = (allergen: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      allergensFree: checked 
        ? [...prev.allergensFree, allergen]
        : prev.allergensFree.filter(a => a !== allergen)
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.mealTime.length > 0) count++;
    if (filters.isOrganic) count++;
    if (filters.maxCalories) count++;
    if (filters.minProtein) count++;
    if (filters.allergensFree.length > 0) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Busque por alimentos, nutrientes ou categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-20 h-12 text-base"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filtros
          {getActiveFiltersCount() > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros Avançados</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({...prev, category: value}))}>
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

              {/* Calories Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Máx. Calorias (por porção)</label>
                <Input
                  type="number"
                  placeholder="Ex: 200"
                  value={filters.maxCalories}
                  onChange={(e) => setFilters(prev => ({...prev, maxCalories: e.target.value}))}
                />
              </div>

              {/* Protein Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mín. Proteína (g)</label>
                <Input
                  type="number"
                  placeholder="Ex: 10"
                  value={filters.minProtein}
                  onChange={(e) => setFilters(prev => ({...prev, minProtein: e.target.value}))}
                />
              </div>
            </div>

            {/* Meal Times */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Horários de Refeição</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mealTimes.map((mealTime) => (
                  <div key={mealTime.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={mealTime.value}
                      checked={filters.mealTime.includes(mealTime.value)}
                      onCheckedChange={(checked) => handleMealTimeChange(mealTime.value, checked as boolean)}
                    />
                    <label htmlFor={mealTime.value} className="text-sm cursor-pointer">
                      {mealTime.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Livre de Alérgenos</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allergens.map((allergen) => (
                  <div key={allergen} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergen}
                      checked={filters.allergensFree.includes(allergen)}
                      onCheckedChange={(checked) => handleAllergenChange(allergen, checked as boolean)}
                    />
                    <label htmlFor={allergen} className="text-sm cursor-pointer capitalize">
                      {allergen}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Organic Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="organic"
                checked={filters.isOrganic}
                onCheckedChange={(checked) => setFilters(prev => ({...prev, isOrganic: checked as boolean}))}
              />
              <label htmlFor="organic" className="text-sm cursor-pointer flex items-center">
                <Leaf className="h-4 w-4 mr-1 text-green-600" />
                Apenas alimentos orgânicos
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : foods.length === 0 ? (
          <Card className="text-center py-10">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum alimento encontrado' : 'Digite algo para buscar alimentos'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {foods.length} alimento{foods.length !== 1 ? 's' : ''} encontrado{foods.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foods.map((food) => (
                <Card 
                  key={food.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
                  onClick={() => onFoodSelect(food)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">
                          {food.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {food.food_group}
                          </Badge>
                          {food.is_organic && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              <Leaf className="h-3 w-3 mr-1" />
                              Orgânico
                            </Badge>
                          )}
                          {food.preparation_time && food.preparation_time > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {food.preparation_time}min
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Calorias</p>
                          <p className="font-semibold text-orange-600">{food.calories}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Proteína</p>
                          <p className="font-semibold text-blue-600">{food.protein}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Carbs</p>
                          <p className="font-semibold text-green-600">{food.carbs}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Gordura</p>
                          <p className="font-semibold text-purple-600">{food.fats}g</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{food.portion_size}{food.portion_unit}</span>
                        {food.sustainability_score && (
                          <div className="flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            Sustentabilidade {food.sustainability_score}/10
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedFoodSearch;
