import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConsultationData, Patient, MealPlan } from '@/types';
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
      const { data: updatedData, error } = await supabase
        .from('consultation_data')
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

  async function saveMealPlan(consultationId: string, mealPlan: MealPlan) {
    try {
      // Format date for Supabase
      const formattedData = {
        ...mealPlan,
        date: format(mealPlan.date, 'yyyy-MM-dd'),
        meals: JSON.stringify(mealPlan.meals),
        total_calories: Number(mealPlan.total_calories),
        total_protein: Number(mealPlan.total_protein),
        total_carbs: Number(mealPlan.total_carbs), 
        total_fats: Number(mealPlan.total_fats),
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

// Example of a function that would fix the insert issue:
async function saveMealPlan(mealPlanData: Record<string, any>) {
  try {
    // Format date for Supabase
    const formattedData = {
      ...mealPlanData,
      date: format(mealPlanData.date, 'yyyy-MM-dd'),
      meals: JSON.stringify(mealPlanData.meals),
      total_calories: Number(mealPlanData.total_calories),
      total_protein: Number(mealPlanData.total_protein),
      total_carbs: Number(mealPlanData.total_carbs), 
      total_fats: Number(mealPlanData.total_fats)
    };
    
    const { data, error } = await supabase
      .from('meal_plans')
      .insert(formattedData);
      
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
