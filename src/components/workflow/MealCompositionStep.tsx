
/**
 * Etapa 3: Montagem das Refeições
 * Interface para seleção de alimentos e ajuste de porções
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Utensils, ArrowLeft, Plus, Minus, Search } from 'lucide-react';
import { useNutritionWorkflow } from '@/contexts/NutritionWorkflowContext';
import { calculateMealNutrition } from '@/utils/calculations';
import { searchFoodsEnhanced, type AlimentoV2 } from '@/services/enhancedFoodSearchService';

// Types
interface MealFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion_size: number;
  portion_unit: string;
  portion: number; // Multiplicador da porção padrão
}

export const MealCompositionStep: React.FC = () => {
  const { 
    profile,
    energyCalculation,
    macroDefinition,
    mealPlan,
    updateMealPlan,
    setCurrentStep,
    errors
  } = useNutritionWorkflow();

  // State
  const [foods, setFoods] = useState<AlimentoV2[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealIndex, setSelectedMealIndex] = useState(0);
  const [mealFoods, setMealFoods] = useState<MealFood[][]>([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);

  // Initialize meal structure
  useEffect(() => {
    if (macroDefinition?.mealDistribution && mealFoods.length === 0) {
      const initialMeals = macroDefinition.mealDistribution.map(() => []);
      setMealFoods(initialMeals);
    }
  }, [macroDefinition, mealFoods.length]);

  // Load foods using enhanced search
  const loadFoods = async (query = '') => {
    setIsLoadingFoods(true);
    try {
      const result = await searchFoodsEnhanced({ 
        query: query || undefined,
        limit: 50 
      });
      setFoods(result.foods);
    } catch (error) {
      console.error('Erro ao carregar alimentos:', error);
      setFoods([]);
    } finally {
      setIsLoadingFoods(false);
    }
  };

  // Load foods on component mount and search query change
  useEffect(() => {
    loadFoods(searchQuery);
  }, [searchQuery]);

  // Add food to current meal
  const addFoodToMeal = (food: AlimentoV2) => {
    const mealFood: MealFood = {
      id: food.id,
      name: food.nome,
      calories: food.kcal_por_referencia,
      protein: food.ptn_g_por_referencia,
      carbs: food.cho_g_por_referencia,
      fats: food.lip_g_por_referencia,
      portion_size: food.peso_referencia_g,
      portion_unit: food.medida_padrao_referencia,
      portion: 1 // Porção padrão
    };

    const newMealFoods = [...mealFoods];
    newMealFoods[selectedMealIndex] = [...(newMealFoods[selectedMealIndex] || []), mealFood];
    setMealFoods(newMealFoods);
    updateMealPlan(newMealFoods);
  };

  // Remove food from meal
  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const newMealFoods = [...mealFoods];
    newMealFoods[mealIndex] = newMealFoods[mealIndex].filter((_, i) => i !== foodIndex);
    setMealFoods(newMealFoods);
    updateMealPlan(newMealFoods);
  };

  // Update food portion
  const updateFoodPortion = (mealIndex: number, foodIndex: number, newPortion: number) => {
    const newMealFoods = [...mealFoods];
    newMealFoods[mealIndex][foodIndex].portion = Math.max(0.1, newPortion);
    setMealFoods(newMealFoods);
    updateMealPlan(newMealFoods);
  };

  // Calculate meal nutrition
  const getMealNutrition = (mealIndex: number) => {
    const meal = mealFoods[mealIndex] || [];
    return calculateMealNutrition(meal);
  };

  // Get meal target from macro definition
  const getMealTarget = (mealIndex: number) => {
    if (!macroDefinition?.mealDistribution || !macroDefinition.mealDistribution[mealIndex]) {
      return null;
    }
    return macroDefinition.mealDistribution[mealIndex];
  };

  if (!profile || !energyCalculation || !macroDefinition) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Complete as etapas anteriores primeiro</p>
          <Button onClick={() => setCurrentStep(2)} className="mt-4">
            Voltar para Etapa 2
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentMealTarget = getMealTarget(selectedMealIndex);
  const currentMealNutrition = getMealNutrition(selectedMealIndex);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Etapa 3: Montagem das Refeições
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção da Refeição */}
          <div>
            <Label htmlFor="mealSelect">Selecionar Refeição</Label>
            <Select 
              value={selectedMealIndex.toString()} 
              onValueChange={(value) => setSelectedMealIndex(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {macroDefinition.mealDistribution?.map((meal, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    Refeição {index + 1} ({meal.percentage}% - {meal.total.kcal} kcal)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meta da Refeição Atual */}
          {currentMealTarget && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium mb-3">Meta da Refeição {selectedMealIndex + 1}:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="font-medium">Proteína:</span><br />
                  <Badge variant="outline">{currentMealTarget.protein.grams}g</Badge>
                </div>
                <div>
                  <span className="font-medium">Carboidratos:</span><br />
                  <Badge variant="outline">{currentMealTarget.carbohydrate.grams}g</Badge>
                </div>
                <div>
                  <span className="font-medium">Lipídios:</span><br />
                  <Badge variant="outline">{currentMealTarget.lipid.grams}g</Badge>
                </div>
                <div>
                  <span className="font-medium">Total:</span><br />
                  <Badge variant="outline">{currentMealTarget.total.kcal} kcal</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Busca de Alimentos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Label htmlFor="foodSearch">Buscar Alimentos</Label>
            </div>
            <Input
              id="foodSearch"
              type="text"
              placeholder="Digite o nome do alimento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {isLoadingFoods ? (
              <p className="text-sm text-gray-500">Carregando alimentos...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {foods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{food.nome}</p>
                      <p className="text-xs text-gray-500">
                        {food.kcal_por_referencia} kcal | P: {food.ptn_g_por_referencia}g | C: {food.cho_g_por_referencia}g | G: {food.lip_g_por_referencia}g
                        <br />
                        Porção: {food.peso_referencia_g}g ({food.medida_padrao_referencia})
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addFoodToMeal(food)}
                      className="ml-2"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alimentos da Refeição Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Alimentos da Refeição {selectedMealIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          {mealFoods[selectedMealIndex]?.length > 0 ? (
            <div className="space-y-3">
              {mealFoods[selectedMealIndex].map((food, index) => (
                <div key={`${food.id}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{food.name}</p>
                    <p className="text-sm text-gray-500">
                      {(food.calories * food.portion).toFixed(1)} kcal | 
                      P: {(food.protein * food.portion).toFixed(1)}g | 
                      C: {(food.carbs * food.portion).toFixed(1)}g | 
                      G: {(food.fats * food.portion).toFixed(1)}g
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Porção:</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateFoodPortion(selectedMealIndex, index, food.portion - 0.1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={food.portion}
                        onChange={(e) => updateFoodPortion(selectedMealIndex, index, parseFloat(e.target.value) || 0.1)}
                        className="w-16 text-center"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateFoodPortion(selectedMealIndex, index, food.portion + 0.1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-sm text-gray-500">× {food.portion_size}{food.portion_unit}</span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFoodFromMeal(selectedMealIndex, index)}
                    className="text-red-600"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Nenhum alimento adicionado a esta refeição
            </p>
          )}
        </CardContent>
      </Card>

      {/* Totais da Refeição vs Meta */}
      {currentMealTarget && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação: Atual vs Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium">Proteína</p>
                <p className="text-lg font-bold text-orange-600">
                  {currentMealNutrition.protein.grams.toFixed(1)}g
                </p>
                <p className="text-xs text-gray-500">
                  Meta: {currentMealTarget.protein.grams}g
                </p>
                <Badge 
                  variant={
                    Math.abs(currentMealNutrition.protein.grams - currentMealTarget.protein.grams) < 2 
                      ? "default" : "secondary"
                  }
                  className="mt-1"
                >
                  {currentMealNutrition.protein.grams > currentMealTarget.protein.grams ? '+' : ''}
                  {(currentMealNutrition.protein.grams - currentMealTarget.protein.grams).toFixed(1)}g
                </Badge>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium">Carboidratos</p>
                <p className="text-lg font-bold text-purple-600">
                  {currentMealNutrition.carbohydrate.grams.toFixed(1)}g
                </p>
                <p className="text-xs text-gray-500">
                  Meta: {currentMealTarget.carbohydrate.grams}g
                </p>
                <Badge 
                  variant={
                    Math.abs(currentMealNutrition.carbohydrate.grams - currentMealTarget.carbohydrate.grams) < 3 
                      ? "default" : "secondary"
                  }
                  className="mt-1"
                >
                  {currentMealNutrition.carbohydrate.grams > currentMealTarget.carbohydrate.grams ? '+' : ''}
                  {(currentMealNutrition.carbohydrate.grams - currentMealTarget.carbohydrate.grams).toFixed(1)}g
                </Badge>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium">Lipídios</p>
                <p className="text-lg font-bold text-blue-600">
                  {currentMealNutrition.lipid.grams.toFixed(1)}g
                </p>
                <p className="text-xs text-gray-500">
                  Meta: {currentMealTarget.lipid.grams}g
                </p>
                <Badge 
                  variant={
                    Math.abs(currentMealNutrition.lipid.grams - currentMealTarget.lipid.grams) < 1 
                      ? "default" : "secondary"
                  }
                  className="mt-1"
                >
                  {currentMealNutrition.lipid.grams > currentMealTarget.lipid.grams ? '+' : ''}
                  {(currentMealNutrition.lipid.grams - currentMealTarget.lipid.grams).toFixed(1)}g
                </Badge>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium">Calorias</p>
                <p className="text-lg font-bold text-green-600">
                  {currentMealNutrition.total.kcal.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">
                  Meta: {currentMealTarget.total.kcal} kcal
                </p>
                <Badge 
                  variant={
                    Math.abs(currentMealNutrition.total.kcal - currentMealTarget.total.kcal) < 50 
                      ? "default" : "secondary"
                  }
                  className="mt-1"
                >
                  {currentMealNutrition.total.kcal > currentMealTarget.total.kcal ? '+' : ''}
                  {(currentMealNutrition.total.kcal - currentMealTarget.total.kcal).toFixed(0)} kcal
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Etapa Anterior
        </Button>
        
        <Button 
          onClick={() => console.log('Workflow completo!')}
          className="bg-green-600 hover:bg-green-700"
        >
          Finalizar Plano Alimentar
        </Button>
      </div>
    </div>
  );
};
