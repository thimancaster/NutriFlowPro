
import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConsultationData } from '@/types';
import { MealPlan } from '@/types/meal';
import { format } from 'date-fns';
import { usePatient } from '@/contexts/patient/PatientContext'; // Import PatientContext

interface MealPlanContextProps {
  // Remove activePatient - use PatientContext instead
  consultationData: ConsultationData | null;
  setConsultationData: (data: ConsultationData | null) => void;
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan | null) => void;
  saveConsultation: (data: any) => Promise<any>;
  saveMealPlan: (consultationId: string, mealPlan: MealPlan) => Promise<any>;
}

const MealPlanContext = createContext<MealPlanContextProps | undefined>(undefined);

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};

interface MealPlanProviderProps {
  children: ReactNode;
}

export const MealPlanProvider: React.FC<MealPlanProviderProps> = ({ children }) => {
  // Remove activePatient state - use PatientContext
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  async function saveConsultation(data: any) {
    try {
      // For calculation data instead of consultation_data
      const { data: updatedData, error } = await supabase
        .from('calculations')
        .upsert(data)
        .select()
        .single();

      if (error) {
        console.error('Error saving consultation:', error);
        throw error;
      }

      return updatedData;
    } catch (error) {
      console.error('Error in saveConsultation:', error);
      throw error;
    }
  }

  async function saveMealPlan(consultationId: string, mealPlan: MealPlan) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .upsert({
          id: mealPlan.id,
          user_id: mealPlan.user_id,
          patient_id: mealPlan.patient_id,
          calculation_id: consultationId,
          date: format(new Date(), 'yyyy-MM-dd'),
          meals: mealPlan.meals || [],
          total_calories: mealPlan.total_calories,
          total_protein: mealPlan.total_protein,
          total_carbs: mealPlan.total_carbs,
          total_fats: mealPlan.total_fats,
          notes: mealPlan.notes,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving meal plan:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in saveMealPlan:', error);
      throw error;
    }
  }

  return (
    <MealPlanContext.Provider
      value={{
        // Remove activePatient - components should use usePatient() hook
        consultationData,
        setConsultationData,
        mealPlan,
        setMealPlan,
        saveConsultation,
        saveMealPlan,
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
};
