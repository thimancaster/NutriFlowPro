
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import { storageUtils } from '@/utils/storageUtils';

interface MealPlan {
  id?: string;
  date?: string;
  patient_id?: string;
  meals?: any[];
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fats?: number;
}

interface MealPlanContextType {
  mealPlan: MealPlan | null;
  setMealPlan: (plan: MealPlan | null) => void;
  saveMealPlan: () => Promise<string | undefined>;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activePatient } = usePatient();

  // Check for meal plan in sessionStorage on mount
  useEffect(() => {
    const storedMealPlan = storageUtils.getSessionItem('mealPlan');
    if (storedMealPlan) {
      setMealPlan(storedMealPlan);
    }
  }, []);

  // Update sessionStorage when meal plan changes
  useEffect(() => {
    if (mealPlan) {
      storageUtils.setSessionItem('mealPlan', mealPlan);
    } else {
      storageUtils.removeSessionItem('mealPlan');
    }
  }, [mealPlan]);

  const saveMealPlan = async (): Promise<string | undefined> => {
    if (!user?.id || !activePatient?.id || !mealPlan || !mealPlan.meals) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para salvar o plano alimentar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save the meal plan to the database
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          patient_id: activePatient.id,
          meals: mealPlan.meals,
          total_calories: mealPlan.total_calories || 0,
          total_protein: mealPlan.total_protein || 0,
          total_carbs: mealPlan.total_carbs || 0,
          total_fats: mealPlan.total_fats || 0,
          date: new Date().toISOString().split('T')[0]
        })
        .select('id')
        .single();

      if (error) throw error;
      
      toast({
        title: "Plano alimentar salvo",
        description: "O plano alimentar foi salvo com sucesso."
      });
      
      return data.id;
    } catch (error: any) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Erro ao salvar plano alimentar",
        description: error.message,
        variant: "destructive"
      });
      return undefined;
    }
  };

  return (
    <MealPlanContext.Provider
      value={{
        mealPlan,
        setMealPlan,
        saveMealPlan
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};
