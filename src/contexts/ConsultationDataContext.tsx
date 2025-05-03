
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import { storageUtils } from '@/utils/storageUtils';

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

interface ConsultationDataContextType {
  consultationData: ConsultationData | null;
  setConsultationData: (data: ConsultationData | null) => void;
  saveConsultation: () => Promise<string | undefined>;
}

const ConsultationDataContext = createContext<ConsultationDataContextType | undefined>(undefined);

export const ConsultationDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activePatient } = usePatient();

  // Check for consultation data in sessionStorage on mount
  useEffect(() => {
    const storedConsultation = storageUtils.getSessionItem('consultationData');
    if (storedConsultation) {
      setConsultationData(storedConsultation);
    }
  }, []);

  // Update sessionStorage when consultation data changes
  useEffect(() => {
    if (consultationData) {
      storageUtils.setSessionItem('consultationData', consultationData);
    } else {
      storageUtils.removeSessionItem('consultationData');
    }
  }, [consultationData]);

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

  return (
    <ConsultationDataContext.Provider
      value={{
        consultationData,
        setConsultationData,
        saveConsultation
      }}
    >
      {children}
    </ConsultationDataContext.Provider>
  );
};

export const useConsultationData = () => {
  const context = useContext(ConsultationDataContext);
  if (context === undefined) {
    throw new Error('useConsultationData must be used within a ConsultationDataProvider');
  }
  return context;
};
