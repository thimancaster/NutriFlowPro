
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MealItem, MealList } from './MealList';
import MacroDistribution from './MacroDistribution';
import { saveMealPlan } from '@/services/mealPlanService';

interface MealAssemblyProps {
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  patientName: string;
  patientData: {
    age?: number;
    weight?: number;
    height?: number;
  };
  patientId?: string;
}

const MealAssembly: React.FC<MealAssemblyProps> = ({ 
  totalCalories, 
  macros, 
  patientName, 
  patientData,
  patientId 
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [meals, setMeals] = useState<MealItem[]>([
    { name: 'Café da Manhã', percentage: 25, foods: [] },
    { name: 'Lanche da Manhã', percentage: 10, foods: [] },
    { name: 'Almoço', percentage: 30, foods: [] },
    { name: 'Lanche da Tarde', percentage: 10, foods: [] },
    { name: 'Jantar', percentage: 20, foods: [] },
    { name: 'Ceia', percentage: 5, foods: [] },
  ]);

  const handleMealPercentageChange = (index: number, newValue: number) => {
    const updatedMeals = [...meals];
    updatedMeals[index].percentage = newValue;
    setMeals(updatedMeals);
  };

  const getTotalPercentage = () => {
    return meals.reduce((sum, meal) => sum + meal.percentage, 0);
  };

  const handleSaveMealPlan = async () => {
    if (!patientId) {
      toast({
        title: "Erro ao salvar",
        description: "Selecione um paciente para salvar o plano alimentar.",
        variant: "destructive"
      });
      return;
    }
    
    if (getTotalPercentage() !== 100) {
      toast({
        title: "Distribuição inválida",
        description: "A distribuição total das refeições deve ser igual a 100%.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Process meals for storing
      const processedMeals = meals.map(meal => ({
        name: meal.name,
        percentage: meal.percentage,
        calories: Math.round(totalCalories * (meal.percentage / 100)),
        protein: Math.round(macros.protein * (meal.percentage / 100)),
        carbs: Math.round(macros.carbs * (meal.percentage / 100)),
        fat: Math.round(macros.fat * (meal.percentage / 100)),
        foods: meal.foods
      }));
      
      // Create meal plan object
      const mealPlanData = {
        patient_id: patientId,
        date: new Date().toISOString().split('T')[0],
        meals: processedMeals,
        total_calories: totalCalories,
        total_protein: macros.protein,
        total_carbs: macros.carbs,
        total_fats: macros.fat
      };
      
      const result = await saveMealPlan(mealPlanData);
      
      if (result.success) {
        toast({
          title: "Plano alimentar salvo",
          description: "O plano alimentar foi salvo com sucesso.",
        });
      } else {
        throw new Error(result.error || "Erro ao salvar plano alimentar");
      }
    } catch (error: any) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o plano alimentar.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Plano para: {patientName}</h2>
          <p className="text-gray-600 text-sm">
            {patientData.age && `${patientData.age} anos `}
            {patientData.weight && `• ${patientData.weight} kg `}
            {patientData.height && `• ${patientData.height} cm `}
          </p>
        </div>
        
        <Card className="w-full md:w-auto">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">Requisitos Nutricionais</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-gray-500">Calorias</p>
                <p className="font-semibold">{totalCalories} kcal</p>
              </div>
              <div>
                <p className="text-gray-500">Proteínas</p>
                <p className="font-semibold">{macros.protein}g</p>
              </div>
              <div>
                <p className="text-gray-500">Carboidratos</p>
                <p className="font-semibold">{macros.carbs}g</p>
              </div>
              <div>
                <p className="text-gray-500">Gorduras</p>
                <p className="font-semibold">{macros.fat}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 border p-4 rounded-lg">
        <h3 className="font-medium mb-3">Distribuição das Refeições</h3>
        
        <MacroDistribution 
          meals={meals} 
          onChange={handleMealPercentageChange}
        />
        
        {getTotalPercentage() !== 100 && (
          <div className="mt-2 text-amber-600 text-sm font-medium">
            Total: {getTotalPercentage()}% (deve ser 100%)
          </div>
        )}
      </div>

      <MealList 
        meals={meals} 
        totalCalories={totalCalories}
        macros={macros}
      />

      <div className="flex justify-end">
        <Button
          className="bg-nutri-green hover:bg-nutri-green-dark" 
          onClick={handleSaveMealPlan}
          disabled={isSaving || !patientId}
        >
          {isSaving ? "Salvando..." : "Salvar Plano Alimentar"}
        </Button>
      </div>
    </div>
  );
};

export default MealAssembly;
