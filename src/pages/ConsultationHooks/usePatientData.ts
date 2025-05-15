
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { calculateAge, getObjectiveFromGoals } from '@/utils/patientUtils';

interface PatientDataUpdateParams {
  measurements?: {
    weight?: number;
    height?: number;
  };
}

const usePatientData = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  // Helper function to convert patient data
  const convertPatientData = (dbPatient: any): Patient => {
    let address = dbPatient.address;
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
      } catch (e) {
        address = {}; // Initialize with empty object that matches the Patient interface
      }
    }
    
    let goals = dbPatient.goals;
    if (typeof goals === 'string') {
      try {
        goals = JSON.parse(goals);
      } catch (e) {
        goals = { objective: undefined, profile: undefined };
      }
    }
    
    return {
      ...dbPatient,
      address: address || {},
      goals: goals || {}
    };
  };

  const fetchPatientData = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (error) throw error;
      
      // Convert the raw data to a Patient type with correct structure
      const patient = convertPatientData(data);
      setActivePatient(patient);
      return patient;
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do paciente.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updatePatientData = async (patientId: string, updateData: PatientDataUpdateParams) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          measurements: updateData.measurements
        })
        .eq('id', patientId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating patient data:', error);
      return false;
    }
  };

  // Get patient ID from URL query params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const patientId = urlParams.get('patientId');
    
    if (patientId) {
      fetchPatientData(patientId);
    }
  }, [location]);

  return {
    activePatient,
    setActivePatient,
    fetchPatientData,
    updatePatientData
  };
};

export default usePatientData;
