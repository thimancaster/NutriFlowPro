
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ConsultationData, Patient, MealPlan, MealDistributionItem } from '@/types';
import { DEFAULT_MEAL_DISTRIBUTION, MEAL_NAMES, calculateMealDistribution } from '@/utils/mealPlanUtils';

interface MealDistribution {
  [key: string]: MealDistributionItem;
}

interface UseMealPlanStateProps {
  activePatient: Patient | null;
  consultationData: ConsultationData | null;
  mealPlan: MealPlan | null;
  setMealPlan: (plan: MealPlan | null) => void;
  saveConsultation: () => Promise<string | undefined>;
  saveMealPlan: () => Promise<string | undefined>;
}

export const useMealPlanState = ({
  activePatient,
  consultationData,
  mealPlan,
  setMealPlan,
  saveConsultation,
  saveMealPlan
}: UseMealPlanStateProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [totalMealPercent, setTotalMealPercent] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  
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

  const [mealDistribution, setMealDistribution] = useState<MealDistribution>(
    mealPlan && mealPlan.mealDistribution ? mealPlan.mealDistribution : initialDistribution
  );

  // Calculate meal macros when distribution percentages or total macros change
  useEffect(() => {
    if (!consultationData) return;
    
    const distributionArray = Object.keys(mealDistribution).map(
      mealKey => mealDistribution[mealKey].percent / 100
    );
    
    const { meals, totalCalories, totalProtein, totalCarbs, totalFats } = calculateMealDistribution(
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
    
    // Update the meal plan in the context
    const newMealPlan: MealPlan = {
      meals: Object.values(updatedDistribution),
      mealDistribution: updatedDistribution,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fats: totalFats,
      patient_id: activePatient?.id,
      date: new Date().toISOString().split('T')[0]
    };
    
    setMealPlan(newMealPlan);
    
  }, [consultationData, setMealPlan, activePatient]);

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
          percent: newValue[0]
        }
      };
      
      // Get array of percentages for recalculating
      const distributionArray = Object.keys(updatedDistribution).map(
        key => updatedDistribution[key].percent / 100
      );
      
      if (!consultationData) return prev;
      
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

  const handleSaveMealPlan = async () => {
    setIsSaving(true);
    try {
      // First save the consultation data
      await saveConsultation();
      
      // Then save the meal plan
      await saveMealPlan();
      
      toast({
        title: "Plano alimentar salvo",
        description: "O plano alimentar foi salvo com sucesso."
      });
      
      // Navigate to patient history if we have a patient
      if (activePatient?.id) {
        navigate(`/patient-history/${activePatient.id}`);
      } else {
        navigate('/meal-plans');
      }
    } catch (error) {
      console.error("Error saving meal plan:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o plano alimentar.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    mealDistribution,
    totalMealPercent,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan
  };
};
