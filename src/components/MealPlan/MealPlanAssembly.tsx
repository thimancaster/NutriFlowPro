
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileDown } from 'lucide-react';
import { 
  MEAL_DISTRIBUTIONS,
  filterFoodsByMeal,
  SAMPLE_FOODS 
} from '@/utils/mealAssemblyUtils';
import { generateMealAssemblyPDF } from '@/utils/pdf/mealAssemblyPdfUtils';
import { MealItem, Meal } from '@/types/meal';
import MealPlanAssemblyCard from './MealPlanAssemblyCard';
import MealPlanMacroSummary from './MealPlanMacroSummary';
import MealPlanLoader from './MealPlanLoader';
import MealPlanHeader from './MealPlanHeader';

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
      // Clone the food item so we don't modify the original
      const newFood = { 
        ...food,
        selected: true,
        // Generate a unique ID if one doesn't exist
        id: food.id || `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      updatedMeals[mealIndex].foods = [...updatedMeals[mealIndex].foods, newFood];
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
    return <MealPlanLoader />;
  }

  return (
    <div className="space-y-6">
      <MealPlanHeader 
        generatePDF={generatePDF} 
        generating={generating} 
      />
      
      <MealPlanMacroSummary 
        macros={macros} 
        totalCalories={totalCalories} 
      />
      
      <div className="grid grid-cols-1 gap-6">
        {meals.map((meal, mealIndex) => (
          <MealPlanAssemblyCard
            key={mealIndex}
            meal={meal}
            mealIndex={mealIndex}
            onAddFood={handleAddFood}
            onRemoveFood={handleRemoveFood}
            suggestedFoods={filterFoodsByMeal(meal.name) || SAMPLE_FOODS}
          />
        ))}
      </div>
    </div>
  );
};

export default MealPlanAssembly;
