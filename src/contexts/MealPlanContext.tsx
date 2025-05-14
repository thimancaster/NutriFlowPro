
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth/AuthContext';
import { MealItem, Meal, MealPlan } from '@/types';
import { prepareForSupabase } from '@/utils/dateUtils';

interface MealPlanContextProps {
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan) => void;
  mealItems: MealItem[];
  setMealItems: (items: MealItem[]) => void;
  createMealPlan: (data: Partial<MealPlan>) => Promise<MealPlan>;
  updateMealPlan: (id: string, data: Partial<MealPlan>) => Promise<MealPlan>;
  saveMealPlan: (consultationId: string, data: any) => Promise<string | null>;
  getMealPlans: (patientId?: string) => Promise<{ success: boolean, data?: any[], error?: string }>;
  getMealPlan: (id: string) => Promise<{ success: boolean, data?: MealPlan, error?: string }>;
  resetMealPlan: () => void;
}

const MealPlanContext = createContext<MealPlanContextProps>({
  mealPlan: null,
  setMealPlan: () => {},
  mealItems: [],
  setMealItems: () => {},
  createMealPlan: async () => ({ id: '', user_id: '', patient_id: '', date: new Date(), meals: [], total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0 }),
  updateMealPlan: async () => ({ id: '', user_id: '', patient_id: '', date: new Date(), meals: [], total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0 }),
  saveMealPlan: async () => null,
  getMealPlans: async () => ({ success: false, data: [], error: 'Not implemented' }),
  getMealPlan: async () => ({ success: false, data: undefined, error: 'Not implemented' }),
  resetMealPlan: () => {}
});

export const MealPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  
  // Create a new meal plan
  const createMealPlan = async (data: Partial<MealPlan>) => {
    if (!user) throw new Error('User not authenticated');
    
    const newMealPlan = {
      id: uuidv4(),
      user_id: user.id,
      patient_id: data.patient_id || '',
      date: new Date(),
      total_calories: data.total_calories || 0,
      total_protein: data.total_protein || 0,
      total_carbs: data.total_carbs || 0,
      total_fats: data.total_fats || 0,
      meals: data.meals || [],
      ...data
    } as MealPlan;
    
    try {
      // Prepare data for Supabase with required fields and string dates
      const preparedData = prepareForSupabase({
        user_id: newMealPlan.user_id,
        patient_id: newMealPlan.patient_id,
        date: newMealPlan.date,
        meals: JSON.stringify(newMealPlan.meals || []),
        total_calories: newMealPlan.total_calories,
        total_protein: newMealPlan.total_protein,
        total_carbs: newMealPlan.total_carbs,
        total_fats: newMealPlan.total_fats
      }, true);
      
      const { error } = await supabase
        .from('meal_plans')
        .insert(preparedData);
        
      if (error) throw error;
      
      setMealPlan(newMealPlan);
      return newMealPlan;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      throw error;
    }
  };
  
  // Update an existing meal plan
  const updateMealPlan = async (id: string, data: Partial<MealPlan>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Prepare data for Supabase with proper string dates
      const preparedData = prepareForSupabase(data, false);
      
      // Ensure meals is properly stringified if present
      if (preparedData.meals && typeof preparedData.meals !== 'string') {
        preparedData.meals = JSON.stringify(preparedData.meals);
      }
      
      const { error } = await supabase
        .from('meal_plans')
        .update(preparedData)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const updatedMealPlan = { ...mealPlan, ...data } as MealPlan;
      setMealPlan(updatedMealPlan);
      return updatedMealPlan;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
  };
  
  // Save or update a meal plan
  const saveMealPlan = async (consultationId: string, data: any) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      if (mealPlan?.id) {
        // Update existing meal plan
        const updateData = {
          meals: JSON.stringify(data.meals || []),
          mealDistribution: JSON.stringify(data.mealDistribution || []),
          total_calories: data.calories || 0,
          total_protein: data.protein || 0,
          total_carbs: data.carbs || 0,
          total_fats: data.fat || 0,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('meal_plans')
          .update(updateData)
          .eq('id', mealPlan.id);
          
        if (error) throw error;
        
        return mealPlan.id;
      } else {
        // Create new meal plan
        const newMealPlanId = uuidv4();
        
        const newPlanData = {
          id: newMealPlanId,
          user_id: user.id,
          patient_id: data.patient_id,
          date: new Date().toISOString(),
          meals: JSON.stringify(data.meals || []),
          mealDistribution: JSON.stringify(data.mealDistribution || []),
          total_calories: data.calories || 0,
          total_protein: data.protein || 0,
          total_carbs: data.carbs || 0,
          total_fats: data.fat || 0
        };
        
        const { error } = await supabase
          .from('meal_plans')
          .insert(newPlanData);
          
        if (error) throw error;
        
        return newMealPlanId;
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      return null;
    }
  };
  
  // Get meal plans for a patient or all patients
  const getMealPlans = async (patientId?: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      let query = supabase
        .from('meal_plans')
        .select(`
          *,
          patients:patient_id (
            name
          )
        `)
        .eq('user_id', user.id);
        
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching meal plans:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Get a specific meal plan by ID
  const getMealPlan = async (id: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          patients:patient_id (
            name,
            gender,
            birth_date
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      setMealPlan(data as unknown as MealPlan);
      return { success: true, data: data as unknown as MealPlan };
    } catch (error: any) {
      console.error('Error fetching meal plan:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Reset meal plan data
  const resetMealPlan = () => {
    setMealPlan(null);
    setMealItems([]);
  };
  
  return (
    <MealPlanContext.Provider
      value={{
        mealPlan,
        setMealPlan,
        mealItems,
        setMealItems,
        createMealPlan,
        updateMealPlan,
        saveMealPlan,
        getMealPlans,
        getMealPlan,
        resetMealPlan
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = () => useContext(MealPlanContext);
