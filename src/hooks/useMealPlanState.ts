
import { useState, useCallback, useMemo, useEffect } from 'react';
import { MealDistributionItem, Patient, ConsultationData, MealPlan } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { mealOptions } from '@/utils/mealGeneratorUtils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type UseMealPlanStateProps = {
  activePatient: Patient | null;
  consultationData: ConsultationData | null;
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan) => void;
  saveConsultation: (data: any) => Promise<any>;
  saveMealPlan: (consultationId: string, mealPlan: MealPlan) => Promise<any>;
};

export const useMealPlanState = ({
  activePatient,
  consultationData,
  mealPlan,
  setMealPlan,
  saveConsultation,
  saveMealPlan
}: UseMealPlanStateProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize meal distribution with multiple default meals instead of just one
  const [mealDistribution, setMealDistribution] = useState<MealDistributionItem[]>(
    mealPlan?.mealDistribution || 
    [
      {
        id: uuidv4(),
        name: 'Café da manhã',
        percentage: 25,
        percent: 25,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        suggestions: []
      },
      {
        id: uuidv4(),
        name: 'Almoço',
        percentage: 40,
        percent: 40,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        suggestions: []
      },
      {
        id: uuidv4(),
        name: 'Jantar',
        percentage: 35,
        percent: 35,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        suggestions: []
      }
    ]
  );

  // Calculate total percentage
  const totalMealPercent = useMemo(() => {
    return mealDistribution.reduce((acc, meal) => acc + (meal.percentage || meal.percent || 0), 0);
  }, [mealDistribution]);

  // Handle meal percentage change
  const handleMealPercentChange = useCallback((id: string, value: number) => {
    setMealDistribution(prev => 
      prev.map(meal => meal.id === id ? { ...meal, percentage: value, percent: value } : meal)
    );
  }, []);

  // Calculate macros for each meal based on the total from consultation data
  useEffect(() => {
    if (consultationData?.results && totalMealPercent === 100) {
      const totalCalories = consultationData.results.get;
      const totalProtein = consultationData.results.macros.protein;
      const totalCarbs = consultationData.results.macros.carbs;
      const totalFat = consultationData.results.macros.fat;
      
      setMealDistribution(prev => 
        prev.map(meal => ({
          ...meal,
          calories: Math.round(totalCalories * (meal.percentage || meal.percent || 0) / 100),
          protein: Math.round(totalProtein * (meal.percentage || meal.percent || 0) / 100),
          carbs: Math.round(totalCarbs * (meal.percentage || meal.percent || 0) / 100),
          fat: Math.round(totalFat * (meal.percentage || meal.percent || 0) / 100),
          suggestions: []
        }))
      );
    }
  }, [consultationData, totalMealPercent]);

  // Handle save meal plan
  const handleSaveMealPlan = useCallback(async () => {
    if (!activePatient || !consultationData) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para salvar o plano alimentar.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Create a simplified mealplan data object
      const mealPlanData: MealPlan = {
        name: `Plano para ${activePatient.name}`,
        patient_id: activePatient.id,
        consultation_id: consultationData.id,
        calories: consultationData.results?.get || 0,
        protein: consultationData.results?.macros.protein || 0,
        carbs: consultationData.results?.macros.carbs || 0,
        fat: consultationData.results?.macros.fat || 0,
        mealDistribution: mealDistribution,
        meals: []
      };

      // Save or update the meal plan - now passing the consultation ID
      await saveMealPlan(consultationData.id, mealPlanData);
      
      // Update the meal plan in context
      setMealPlan(mealPlanData);
      
      toast({
        title: "Plano alimentar salvo",
        description: "Distribuição de refeições foi salva com sucesso.",
      });
      
      // Navigate to the next step in the wizard
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano alimentar.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [activePatient, consultationData, toast, saveMealPlan, setMealPlan, mealDistribution]);

  // Add a new meal to the distribution
  const addMeal = useCallback(() => {
    const newMealId = uuidv4();
    const newMeal: MealDistributionItem = {
      id: newMealId,
      name: mealOptions[Math.min(mealDistribution.length, mealOptions.length - 1)].name,
      percentage: 0,
      percent: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      suggestions: []
    };
    
    setMealDistribution(prev => [...prev, newMeal]);
  }, [mealDistribution]);

  // Remove a meal from the distribution
  const removeMeal = useCallback((id: string) => {
    setMealDistribution(prev => {
      const filtered = prev.filter(meal => meal.id !== id);
      
      // Recalculate percentages to distribute the removed meal's percentage
      const removedMeal = prev.find(meal => meal.id === id);
      const removedPercent = removedMeal ? (removedMeal.percentage || removedMeal.percent || 0) : 0;
      
      if (removedPercent > 0 && filtered.length > 0) {
        const percentPerMeal = removedPercent / filtered.length;
        return filtered.map(meal => ({
          ...meal,
          percentage: (meal.percentage || meal.percent || 0) + percentPerMeal,
          percent: (meal.percentage || meal.percent || 0) + percentPerMeal
        }));
      }
      
      return filtered;
    });
  }, []);

  return {
    mealDistribution,
    totalMealPercent,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan,
    addMeal,
    removeMeal
  };
};
