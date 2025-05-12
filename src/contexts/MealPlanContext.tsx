
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import { storageUtils } from '@/utils/storageUtils';
import { DatabaseService } from '@/services/databaseService';
import { MealPlan } from '@/types';

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
      // Fix: Cast the unknown value to MealPlan
      setMealPlan(storedMealPlan as MealPlan);
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
    if (!user?.id || !activePatient?.id || !mealPlan) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para salvar o plano alimentar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a complete meal plan object that matches the required interface
      const completeMealPlan: MealPlan = {
        ...mealPlan,
        name: mealPlan.name || `Plano para ${activePatient.name}`,
        patient_id: activePatient.id,
        calories: mealPlan.calories || 0,
        protein: mealPlan.protein || 0, 
        carbs: mealPlan.carbs || 0,
        fat: mealPlan.fat || 0,
        meals: mealPlan.meals || []
      };
      
      // Use the DatabaseService instead of direct Supabase call
      const result = await DatabaseService.saveMealPlan(
        user.id,
        activePatient.id,
        '0', // This should be replaced with the actual consultationId
        completeMealPlan
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
