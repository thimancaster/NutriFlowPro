
import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConsultationData, Patient } from '@/types';
import { MealPlan } from '@/types/meal';
import { format } from 'date-fns';

interface MealPlanContextProps {
  activePatient: Patient | null;
  setActivePatient: (patient: Patient | null) => void;
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
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  async function saveConsultation(data: any) {
    try {
      // For calculation data instead of consultation_data
      const { data: updatedData, error } = await supabase
        .from('calculations')
        .upsert(data, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data: updatedData };
    } catch (error: any) {
      console.error('Error saving consultation:', error);
      return { success: false, error };
    }
  }

  async function saveMealPlan(consultationId: string, mealPlanData: MealPlan) {
    try {
      // Format date for Supabase
      const formattedData = {
        id: mealPlanData.id,
        user_id: mealPlanData.user_id,
        patient_id: mealPlanData.patient_id,
        date: typeof mealPlanData.date === 'string' 
          ? mealPlanData.date 
          : format(mealPlanData.date, 'yyyy-MM-dd'),
        meals: JSON.stringify(mealPlanData.meals),
        total_calories: Number(mealPlanData.total_calories),
        total_protein: Number(mealPlanData.total_protein),
        total_carbs: Number(mealPlanData.total_carbs), 
        total_fats: Number(mealPlanData.total_fats),
        consultation_id: consultationId
      };
      
      const { data, error } = await supabase
        .from('meal_plans')
        .upsert(formattedData, { onConflict: 'id' })
        .select()
        .single();
        
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving meal plan:', error);
      return { success: false, error };
    }
  }

  const value: MealPlanContextProps = {
    activePatient,
    setActivePatient,
    consultationData,
    setConsultationData,
    mealPlan,
    setMealPlan,
    saveConsultation,
    saveMealPlan
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
};
