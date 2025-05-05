
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import { storageUtils } from '@/utils/storageUtils';
import { DatabaseService } from '@/services/databaseService';

interface ConsultationData {
  weight?: string;
  height?: string;
  age?: string;
  sex?: string;
  objective?: string;
  profile?: string;
  activityLevel?: string;
  consultationType?: 'primeira_consulta' | 'retorno';
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
  autoSaveConsultation: (consultationId: string, data: any) => Promise<boolean>;
  updateConsultationStatus: (consultationId: string, status: 'em_andamento' | 'completo') => Promise<boolean>;
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
      // Use DatabaseService instead of direct Supabase call
      const result = await DatabaseService.saveConsultation(
        user.id,
        activePatient.id,
        consultationData,
        consultationData.consultationType || 'primeira_consulta'
      );

      if (!result.success) throw new Error(result.error);
      
      toast({
        title: "Consulta salva",
        description: "Os dados da consulta foram salvos com sucesso."
      });
      
      return result.data.id;
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
  
  const autoSaveConsultation = async (consultationId: string, data: any): Promise<boolean> => {
    try {
      if (!consultationId) return false;
      
      const result = await DatabaseService.autoSaveConsultation(consultationId, data);
      return result.success;
    } catch (error) {
      console.error('Auto-save error:', error);
      return false;
    }
  };
  
  const updateConsultationStatus = async (consultationId: string, status: 'em_andamento' | 'completo'): Promise<boolean> => {
    try {
      if (!consultationId) return false;
      
      const result = await DatabaseService.updateConsultationStatus(consultationId, status);
      
      if (result.success) {
        toast({
          title: status === 'completo' ? "Consulta finalizada" : "Status atualizado",
          description: status === 'completo' 
            ? "A consulta foi marcada como completa." 
            : "O status da consulta foi atualizado."
        });
      }
      
      return result.success;
    } catch (error) {
      console.error('Status update error:', error);
      return false;
    }
  };

  return (
    <ConsultationDataContext.Provider
      value={{
        consultationData,
        setConsultationData,
        saveConsultation,
        autoSaveConsultation,
        updateConsultationStatus
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
