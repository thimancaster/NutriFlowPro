
import { useState } from 'react';
import { ToastApi, UsePatientActionsProps } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage patient actions
 */
export const usePatientActions = ({
  toast,
  onPatientSelect
}: UsePatientActionsProps) => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Save patient data to database or local storage
  const savePatient = async (patientData: any) => {
    setIsLoading(true);
    
    try {
      // If the patient has an ID, update existing record
      if (patientData.id) {
        const { data, error } = await supabase
          .from('patients')
          .upsert(patientData)
          .select();
        
        if (error) throw error;
        
        toast.toast({
          title: 'Paciente atualizado',
          description: 'Os dados do paciente foram atualizados com sucesso.',
        });
        
        setSelectedPatient(data[0]);
        return { success: true, data: data[0] };
      } else {
        // Create new patient
        const newPatient = {
          ...patientData,
          id: uuidv4()
        };
        
        const { data, error } = await supabase
          .from('patients')
          .insert(newPatient)
          .select();
        
        if (error) throw error;
        
        toast.toast({
          title: 'Paciente cadastrado',
          description: 'O paciente foi cadastrado com sucesso.',
        });
        
        setSelectedPatient(data[0]);
        return { success: true, data: data[0] };
      }
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast.toast({
        title: 'Erro ao salvar paciente',
        description: error.message || 'Ocorreu um erro ao salvar os dados do paciente.',
        variant: 'destructive'
      });
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedPatient,
    setSelectedPatient,
    savePatient,
    isLoading
  };
};
