
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Patient {
  id: string;
  name: string;
  birth_date?: string | null;
  gender?: string | null;
  goals?: { objective?: string } | null;
  email?: string | null;
}

interface ConsultationData {
  weight?: string;
  height?: string;
  age?: string;
  sex?: string;
  objective?: string;
  profile?: string;
  activityLevel?: string;
  results?: {
    tmb: number;
    fa: number;
    get: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
}

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

interface ConsultationContextType {
  activePatient: Patient | null;
  setActivePatient: (patient: Patient | null) => void;
  consultationData: ConsultationData | null;
  setConsultationData: (data: ConsultationData | null) => void;
  mealPlan: MealPlan | null;
  setMealPlan: (plan: MealPlan | null) => void;
  isConsultationActive: boolean;
  startConsultation: (patient: Patient) => void;
  endConsultation: () => void;
  saveConsultation: () => Promise<string | undefined>;
  saveMealPlan: () => Promise<string | undefined>;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export const ConsultationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check for active consultation in sessionStorage on mount
  useEffect(() => {
    const storedPatient = sessionStorage.getItem('activePatient');
    const storedConsultation = sessionStorage.getItem('consultationData');
    const storedMealPlan = sessionStorage.getItem('mealPlan');

    if (storedPatient) {
      setActivePatient(JSON.parse(storedPatient));
    }
    
    if (storedConsultation) {
      setConsultationData(JSON.parse(storedConsultation));
    }
    
    if (storedMealPlan) {
      setMealPlan(JSON.parse(storedMealPlan));
    }
  }, []);

  // Update sessionStorage when active consultation changes
  useEffect(() => {
    if (activePatient) {
      sessionStorage.setItem('activePatient', JSON.stringify(activePatient));
    } else {
      sessionStorage.removeItem('activePatient');
    }
  }, [activePatient]);

  useEffect(() => {
    if (consultationData) {
      sessionStorage.setItem('consultationData', JSON.stringify(consultationData));
    } else {
      sessionStorage.removeItem('consultationData');
    }
  }, [consultationData]);

  useEffect(() => {
    if (mealPlan) {
      sessionStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    } else {
      sessionStorage.removeItem('mealPlan');
    }
  }, [mealPlan]);

  const startConsultation = (patient: Patient) => {
    setActivePatient(patient);
    setConsultationData(null);
    setMealPlan(null);
    navigate(`/consultation?patientId=${patient.id}`);
  };

  const endConsultation = () => {
    setActivePatient(null);
    setConsultationData(null);
    setMealPlan(null);
    sessionStorage.removeItem('activePatient');
    sessionStorage.removeItem('consultationData');
    sessionStorage.removeItem('mealPlan');
  };

  const saveConsultation = async (): Promise<string | undefined> => {
    if (!user?.id || !activePatient?.id || !consultationData) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para salvar a consulta",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save the consultation data to the database
      const { data, error } = await supabase
        .from('calculations')
        .insert({
          user_id: user.id,
          patient_id: activePatient.id,
          weight: parseFloat(consultationData.weight || '0'),
          height: parseFloat(consultationData.height || '0'),
          age: parseInt(consultationData.age || '0'),
          bmr: consultationData.results?.tmb || 0,
          tdee: consultationData.results?.get || 0,
          protein: consultationData.results?.macros.protein || 0,
          carbs: consultationData.results?.macros.carbs || 0,
          fats: consultationData.results?.macros.fat || 0,
          gender: consultationData.sex === 'M' ? 'male' : 'female',
          activity_level: consultationData.activityLevel,
          goal: consultationData.objective
        })
        .select('id')
        .single();

      if (error) throw error;
      
      toast({
        title: "Consulta salva",
        description: "Os dados da consulta foram salvos com sucesso."
      });
      
      return data.id;
    } catch (error: any) {
      console.error('Error saving consultation:', error);
      toast({
        title: "Erro ao salvar consulta",
        description: error.message,
        variant: "destructive"
      });
      return undefined;
    }
  };

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
    <ConsultationContext.Provider
      value={{
        activePatient,
        setActivePatient,
        consultationData,
        setConsultationData,
        mealPlan,
        setMealPlan,
        isConsultationActive: !!activePatient,
        startConsultation,
        endConsultation,
        saveConsultation,
        saveMealPlan
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};
