
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

export const usePatientDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openPatientDetail = useCallback(async (id: string) => {
    setPatientId(id);
    setIsLoading(true);
    setIsModalOpen(true);

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setPatient(data as Patient);
    } catch (error) {
      console.error('Error loading patient details:', error);
      setPatient(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closePatientDetail = useCallback(() => {
    setIsModalOpen(false);
    // Small delay to let the modal animation finish before clearing state
    setTimeout(() => {
      setPatientId(null);
      setPatient(null);
    }, 300);
  }, []);

  return {
    isModalOpen,
    patientId,
    patient,
    isLoading,
    openPatientDetail,
    closePatientDetail
  };
};
