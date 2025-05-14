
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileDown } from 'lucide-react';
import { 
  MEAL_DISTRIBUTIONS, 
  FOOD_DATABASE, 
  filterFoodsByMeal 
} from '@/utils/mealAssemblyUtils';
import { generateMealAssemblyPDF } from '@/utils/pdf/mealAssemblyPdfUtils';
import { MealItem, Meal } from '@/types/meal';
import MealPlanAssemblyCard from './MealPlanAssemblyCard';

interface MealPlanAssemblyProps {
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  patientName?: string;
  patientData?: any;
}

const MealPlanAssembly: React.FC<MealPlanAssemblyProps> = ({ 
  totalCalories,
  macros,
  patientName = "Paciente",
  patientData
}) => {
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  
  useEffect(() => {
    // Initialize meals with distribution
    const initialMeals = MEAL_DISTRIBUTIONS.map(dist => {
      const protein = Math.round(macros.protein * dist.proteinPercent);
      const carbs = Math.round(macros.carbs * dist.carbsPercent);
      const fat = Math.round(macros.fat * dist.fatPercent);
      const calories = Math.round(protein * 4 + carbs * 4 + fat * 9);
      
      return {
        name: dist.name,
        time: dist.time || '', // Ensure time always has a value
        proteinPercent: dist.proteinPercent,
        carbsPercent: dist.carbsPercent,
        fatPercent: dist.fatPercent,
        protein,
        carbs,
        fat,
        calories,
        foods: [] as MealItem[]
      };
    });
    
    setMeals(initialMeals);
    setLoading(false);
  }, [totalCalories, macros]);
  
  const handleAddFood = (mealIndex: number, food: MealItem) => {
    setMeals(prev => {
      const updatedMeals = [...prev];
      updatedMeals[mealIndex].foods = [...updatedMeals[mealIndex].foods, { ...food, selected: true }];
      return updatedMeals;
    });
    
    toast({
      title: "Alimento adicionado",
      description: `${food.name} adicionado à ${meals[mealIndex].name}`
    });
  };
  
  const handleRemoveFood = (mealIndex: number, foodIndex: number) => {
    setMeals(prev => {
      const updatedMeals = [...prev];
      updatedMeals[mealIndex].foods = updatedMeals[mealIndex].foods.filter((_, idx) => idx !== foodIndex);
      return updatedMeals;
    });
  };
  
  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const doc = generateMealAssemblyPDF({
        meals,
        patientName,
        patientData,
        totalCalories,
        macros
      });
      
      // Save the PDF
      doc.save(`plano_alimentar_${patientName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O plano alimentar foi exportado em PDF"
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao tentar gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-nutri-blue" />
        <span className="ml-2">Carregando plano alimentar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Montagem do Plano Alimentar</h2>
        <Button 
          onClick={generatePDF} 
          disabled={generating}
          className="bg-blue-500 text-white hover:bg-white hover:text-blue-500 border border-blue-500 transition-all duration-200"
        >
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
          Exportar PDF
        </Button>
      </div>
      
      <div className="bg-nutri-gray-light p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Proteínas</p>
            <p className="text-xl font-bold text-nutri-blue">{macros.protein}g</p>
            <p className="text-sm">{Math.round(macros.protein * 4 / totalCalories * 100)}% / {macros.protein * 4} kcal</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Carboidratos</p>
            <p className="text-xl font-bold text-nutri-green">{macros.carbs}g</p>
            <p className="text-sm">{Math.round(macros.carbs * 4 / totalCalories * 100)}% / {macros.carbs * 4} kcal</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gorduras</p>
            <p className="text-xl font-bold text-nutri-teal">{macros.fat}g</p>
            <p className="text-sm">{Math.round(macros.fat * 9 / totalCalories * 100)}% / {macros.fat * 9} kcal</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {meals.map((meal, mealIndex) => (
          <MealPlanAssemblyCard
            key={mealIndex}
            meal={meal}
            mealIndex={mealIndex}
            onAddFood={handleAddFood}
            onRemoveFood={handleRemoveFood}
            suggestedFoods={filterFoodsByMeal(meal.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default MealPlanAssembly;
