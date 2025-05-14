
import React, { createContext, useState, useContext, useEffect } from 'react';
import { MealPlan } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Import the DatabaseService properly
import { MealPlanService } from '@/services/mealPlanService';

interface MealPlanContextType {
  mealPlan: MealPlan | null;
  setMealPlan: (plan: MealPlan | null) => void;
  saveMealPlan: (consultationId: string, mealPlan: MealPlan) => Promise<string | undefined>;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const { user } = useAuth();
  const { activePatient } = usePatient();
  const { toast } = useToast();
  
  useEffect(() => {
    // Load from localStorage on init
    const savedMealPlan = localStorage.getItem('currentMealPlan');
    try {
      if (savedMealPlan) {
        const parsed = JSON.parse(savedMealPlan);
        setMealPlan(parsed);
      }
    } catch (e) {
      console.error('Error loading meal plan from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage when mealPlan changes
    if (mealPlan) {
      localStorage.setItem('currentMealPlan', JSON.stringify(mealPlan));
    }
  }, [mealPlan]);

  const saveMealPlan = async (consultationId: string, mealPlanData: MealPlan): Promise<string | undefined> => {
    if (!user?.id || !activePatient?.id) {
      toast({
        title: "Erro",
        description: "Dados incompletos para salvar o plano alimentar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate a unique ID for the meal plan if it doesn't have one
      const completeMealPlan = {
        ...mealPlanData,
        id: mealPlanData.id || uuidv4(),
        user_id: user.id,
        patient_id: activePatient.id,
        consultation_id: consultationId,
        created_at: mealPlanData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Use MealPlanService directly instead of DatabaseService
      const result = await MealPlanService.saveMealPlan(
        user.id,
        activePatient.id,
        consultationId,
        completeMealPlan
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Plano alimentar salvo",
        description: "O plano alimentar foi salvo com sucesso."
      });

      return result.id;
    } catch (error: any) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o plano alimentar",
        variant: "destructive"
      });
    }
  };

  return (
    <MealPlanContext.Provider value={{ mealPlan, setMealPlan, saveMealPlan }}>
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
