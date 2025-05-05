import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import { storageUtils } from '@/utils/storageUtils';
import { DatabaseService } from '@/services/databaseService';

interface MealPlan {
  id?: string;
  date?: string;
  patient_id?: string;
  meals?: any[];
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fats?: number;
  mealDistribution?: Record<string, any>;
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
      // Use the DatabaseService instead of direct Supabase call
      const result = await DatabaseService.saveMealPlan(
        user.id,
        activePatient.id,
        '0', // This should be replaced with the actual consultationId
        mealPlan
      );

      if (!result.success) throw new Error(result.error);
      
      toast({
        title: "Plano alimentar salvo",
        description: "O plano alimentar foi salvo com sucesso."
      });
      
      return result.data.id;
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
