
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

/**
 * Hook for managing patient detail modal state and data fetching
 */
export const usePatientDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPatientData = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Convert address from string to object if needed
      let patientData = data as Patient;
      if (typeof patientData.address === 'string') {
        try {
          patientData.address = JSON.parse(patientData.address);
        } catch (e) {
          // If parsing fails, set address to null
          patientData.address = null;
        }
      }
      
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient details:', error);
      setPatient(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openPatientDetail = useCallback(async (id: string) => {
    setPatientId(id);
    setIsLoading(true);
    setIsModalOpen(true);
    await fetchPatientData(id);
  }, [fetchPatientData]);

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
    closePatientDetail,
    refreshPatientData: fetchPatientData
  };
};
