
import React, { createContext, useContext, useState } from 'react';
import { MealPlan, Meal, ConsultationData, Patient, Macros } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { prepareForSupabase } from '@/utils/dateUtils';

interface MealPlanContextType {
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan) => void;
  saveMealPlan: (consultationId: string, mealPlan: MealPlan) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateMealPlan: (mealPlanId: string, updates: Partial<MealPlan>) => Promise<{ success: boolean; data?: any; error?: string }>;
  getMealPlansForPatient: (patientId: string) => Promise<{ success: boolean; data?: MealPlan[]; error?: string }>;
  getMealPlan: (mealPlanId: string) => Promise<{ success: boolean; data?: MealPlan; error?: string }>;
  generateMealPlan: (macros: Macros, meals: Record<string, any>) => MealPlan;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate a meal plan based on macros and meal distribution
  const generateMealPlan = (macros: Macros, meals: Record<string, any>): MealPlan => {
    // Implementation details...
    return {
      id: uuidv4(),
      date: new Date(),
      meals: [],
      mealDistribution: meals,
      total_calories: macros.calories || 0,
      total_protein: macros.protein || 0,
      total_carbs: macros.carbs || 0,
      total_fats: macros.fat || 0
    };
  };

  // Save meal plan to database
  const saveMealPlan = async (consultationId: string, mealPlanData: MealPlan) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar um plano alimentar.",
        variant: "destructive"
      });
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      // Create a new object with the structure expected by Supabase
      const dbMealPlan = {
        user_id: user.id,
        patient_id: mealPlanData.patient_id || '',
        date: new Date().toISOString().split('T')[0], // Format date as YYYY-MM-DD string
        meals: mealPlanData.meals,
        total_calories: mealPlanData.total_calories,
        total_protein: mealPlanData.total_protein,
        total_carbs: mealPlanData.total_carbs,
        total_fats: mealPlanData.total_fats
      };

      // Prepare data for database insertion
      const preparedData = prepareForSupabase(dbMealPlan, true);

      const { data, error } = await supabase
        .from('meal_plans')
        .insert([preparedData])
        .select();

      if (error) throw error;

      toast({
        title: "Plano alimentar salvo",
        description: "O plano alimentar foi salvo com sucesso.",
      });

      return { success: true, data: data[0] };
    } catch (error: any) {
      console.error("Error saving meal plan:", error);
      toast({
        title: "Erro ao salvar plano alimentar",
        description: error.message || "Ocorreu um erro ao salvar o plano alimentar.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  // Update an existing meal plan
  const updateMealPlan = async (mealPlanId: string, updates: Partial<MealPlan>) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para atualizar um plano alimentar.",
        variant: "destructive"
      });
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      // Create a new object with the updates
      const updatedMealPlan = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Prepare data for update
      const preparedData = prepareForSupabase(updatedMealPlan);

      const { data, error } = await supabase
        .from('meal_plans')
        .update(preparedData)
        .eq('id', mealPlanId)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;

      toast({
        title: "Plano alimentar atualizado",
        description: "O plano alimentar foi atualizado com sucesso.",
      });

      return { success: true, data: data[0] };
    } catch (error: any) {
      console.error("Error updating meal plan:", error);
      toast({
        title: "Erro ao atualizar plano alimentar",
        description: error.message || "Ocorreu um erro ao atualizar o plano alimentar.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  // Get meal plans for a specific patient
  const getMealPlansForPatient = async (patientId: string) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) throw error;

      // Convert dates from string to Date objects
      const mealPlansWithDates = data.map(plan => ({
        ...plan,
        date: new Date(plan.date)
      })) as unknown as MealPlan[];

      return { success: true, data: mealPlansWithDates };
    } catch (error: any) {
      console.error("Error getting meal plans:", error);
      return { success: false, error: error.message };
    }
  };

  // Get a specific meal plan by ID
  const getMealPlan = async (mealPlanId: string) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', mealPlanId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Convert date from string to Date object
      const mealPlanWithDate = {
        ...data,
        date: new Date(data.date)
      } as unknown as MealPlan;

      return { success: true, data: mealPlanWithDate };
    } catch (error: any) {
      console.error("Error getting meal plan:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <MealPlanContext.Provider
      value={{
        mealPlan,
        setMealPlan,
        saveMealPlan,
        updateMealPlan,
        getMealPlansForPatient,
        getMealPlan,
        generateMealPlan
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
