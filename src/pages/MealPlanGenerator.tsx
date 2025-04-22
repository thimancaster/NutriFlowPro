import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, FileText } from 'lucide-react';
import { DEFAULT_MEAL_DISTRIBUTION, MEAL_NAMES, calculateMealDistribution } from '@/utils/mealPlanUtils';

interface MealDistribution {
  [key: string]: {
    name: string;
    percent: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    suggestions: string[];
  };
}

const MealPlanGenerator = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const consultationData = location.state?.consultation;
  
  // Ensure we have the data
  useEffect(() => {
    if (!consultationData) {
      toast({
        title: "Dados insuficientes",
        description: "Por favor, complete uma consulta primeiro.",
        variant: "destructive",
      });
      navigate('/consultation');
    }
  }, [consultationData, navigate, toast]);

  const [totalMealPercent, setTotalMealPercent] = useState(100);
  
  // Initial meal distribution based on our utility
  const initialDistribution: MealDistribution = {};
  DEFAULT_MEAL_DISTRIBUTION.forEach((percent, index) => {
    initialDistribution[`meal${index + 1}`] = {
      name: MEAL_NAMES[index],
      percent: percent * 100,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      suggestions: [],
    };
  });

  const [mealDistribution, setMealDistribution] = useState<MealDistribution>(initialDistribution);

  // Calculate meal macros when distribution percentages or total macros change
  useEffect(() => {
    if (!consultationData) return;
    
    const distributionArray = Object.keys(mealDistribution).map(
      mealKey => mealDistribution[mealKey].percent / 100
    );
    
    const { meals } = calculateMealDistribution(
      consultationData.results.get, 
      consultationData.objective,
      distributionArray
    );
    
    const updatedDistribution = { ...mealDistribution };
    
    meals.forEach((meal, index) => {
      const mealKey = `meal${index + 1}`;
      updatedDistribution[mealKey] = {
        ...updatedDistribution[mealKey],
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.cho,
        fat: meal.fat,
        suggestions: meal.foodSuggestions
      };
    });
    
    setMealDistribution(updatedDistribution);
    
  }, [consultationData]);

  // Update a specific meal's percentage
  const handleMealPercentChange = (mealKey: string, newValue: number[]) => {
    const newPercent = newValue[0];
    
    setMealDistribution(prev => {
      const prevPercent = prev[mealKey].percent;
      const diff = newPercent - prevPercent;
      
      // Don't allow changes that would make total percent go over/under 100%
      if (totalMealPercent + diff !== 100) {
        return prev;
      }
      
      // Create updated distribution
      const updatedDistribution = {
        ...prev,
        [mealKey]: {
          ...prev[mealKey],
          percent: newPercent
        }
      };
      
      // Get array of percentages for recalculating
      const distributionArray = Object.keys(updatedDistribution).map(
        key => updatedDistribution[key].percent / 100
      );
      
      // Recalculate macros for all meals
      const { meals } = calculateMealDistribution(
        consultationData.results.get, 
        consultationData.objective,
        distributionArray
      );
      
      // Update all meal values
      meals.forEach((meal, index) => {
        const currMealKey = `meal${index + 1}`;
        updatedDistribution[currMealKey] = {
          ...updatedDistribution[currMealKey],
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.cho,
          fat: meal.fat,
          suggestions: meal.foodSuggestions
        };
      });
      
      return updatedDistribution;
    });
    
    // Update total percentage
    setTotalMealPercent(prev => prev + (newValue[0] - mealDistribution[mealKey].percent));
  };

  const handleSaveMealPlan = () => {
    // Here you would save the meal plan to your database
    console.log('Saving meal plan:', { mealDistribution, consultationData });
    
    toast({
      title: "Plano alimentar salvo",
      description: "O plano alimentar foi salvo com sucesso.",
    });
    
    // Navigate to patient history or dashboard
    navigate('/');
  };

  if (!consultationData) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-nutri-blue mb-2">Plano Alimentar</h1>
            <p className="text-gray-600">
              Distribua as calorias e macronutrientes entre as refeições
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex gap-2"
                onClick={() => navigate(-1)}
              >
                <FileText className="h-4 w-4" />
                Voltar para consulta
              </Button>
              
              <Button 
                className="bg-nutri-green hover:bg-nutri-green-dark flex gap-2"
                onClick={handleSaveMealPlan}
              >
                <Save className="h-4 w-4" />
                Salvar Plano
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Calorias</p>
              <p className="text-xl font-bold text-nutri-blue">{consultationData.results.get} kcal</p>
            </div>
            <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Proteínas</p>
              <p className="text-xl font-bold text-nutri-blue">{consultationData.results.macros.protein}g</p>
            </div>
            <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Carboidratos</p>
              <p className="text-xl font-bold text-nutri-green">{consultationData.results.macros.carbs}g</p>
            </div>
            <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Gorduras</p>
              <p className="text-xl font-bold text-amber-500">{consultationData.results.macros.fat}g</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm mb-1">
          Distribuição total: <span className={totalMealPercent === 100 ? "text-green-600" : "text-red-600"}>
            {totalMealPercent}%
          </span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(mealDistribution).map((mealKey) => {
            const meal = mealDistribution[mealKey];
            
            return (
              <Card 
                key={mealKey}
                className="nutri-card shadow-md border-none hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex justify-between">
                    {meal.name}
                    <span className="text-nutri-blue font-medium">{meal.percent}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ajustar percentual</span>
                      </div>
                      <Slider 
                        value={[meal.percent]} 
                        min={0} 
                        max={100}
                        step={1}
                        onValueChange={(value) => handleMealPercentChange(mealKey, value)}
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Calorias:</span>
                        <span className="font-medium">{meal.calories} kcal</span>
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-xs">
                          <span>Proteínas</span>
                          <span>{meal.protein}g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-nutri-blue h-1.5 rounded-full" 
                            style={{ width: `${(meal.protein * 4 * 100) / meal.calories}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span>Carboidratos</span>
                          <span>{meal.carbs}g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-nutri-green h-1.5 rounded-full" 
                            style={{ width: `${(meal.carbs * 4 * 100) / meal.calories}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span>Gorduras</span>
                          <span>{meal.fat}g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full" 
                            style={{ width: `${(meal.fat * 9 * 100) / meal.calories}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm font-medium mb-2">Sugestões de alimentos:</p>
                      <ul className="text-sm space-y-1">
                        {meal.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-gray-600">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
