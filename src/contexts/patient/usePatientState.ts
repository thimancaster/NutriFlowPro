
import { useState, useEffect } from 'react';
import { Patient, PatientGoals, PatientMeasurements } from '@/types';
import { storageUtils } from '@/utils/storageUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePatientState = () => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Load active patient from session storage on mount
  useEffect(() => {
    const storedPatient = storageUtils.getSessionItem('activePatient');
    if (storedPatient) {
      setActivePatient(storedPatient as Patient);
    }

    // Load recent patients from local storage
    const storedRecentPatients = storageUtils.getLocalItem('recentPatients');
    if (storedRecentPatients) {
      setRecentPatients(storedRecentPatients as Patient[]);
    }
  }, []);

  // Update session storage when active patient changes
  useEffect(() => {
    if (activePatient) {
      storageUtils.setSessionItem('activePatient', activePatient);
    } else {
      storageUtils.removeSessionItem('activePatient');
    }
  }, [activePatient]);

  // Helper function to safely parse JSON data
  const safeParseJson = (data: any): any => {
    if (!data) return null;
    
    if (typeof data === 'object') return data;
    
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse JSON data:', e);
        return null;
      }
    }
    
    return null;
  };

  // Load patient by ID from the database
  const loadPatientById = async (patientId: string) => {
    if (!patientId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading patient by ID:', patientId);
      
      const { data, error: supabaseError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      if (data) {
        console.log('Patient data loaded:', data);
        
        // Parse the JSON fields
        const goalsData = safeParseJson(data.goals) || {};
        const measurementsData = safeParseJson(data.measurements) || {};
        
        // Handle address field
        let addressData: any = data.address;
        if (typeof addressData === 'string') {
          try {
            addressData = JSON.parse(addressData);
          } catch (e) {
            console.log('Address is a string and could not be parsed as JSON');
          }
        }

        // Create a properly structured Patient object
        const patient: Patient = {
          ...data,
          status: (data.status as 'active' | 'archived') || 'active',
          gender: (data.gender as 'male' | 'female' | 'other') || undefined,
          goals: {
            objective: goalsData?.objective || undefined,
            profile: goalsData?.profile || undefined,
            targetWeight: goalsData?.targetWeight || undefined,
            initialWeight: goalsData?.initialWeight || undefined,
          } as PatientGoals,
          address: addressData || undefined,
          measurements: {
            weight: measurementsData?.weight || undefined,
            height: measurementsData?.height || undefined,
            body_fat: measurementsData?.body_fat || undefined,
            muscle_mass: measurementsData?.muscle_mass || undefined,
          } as PatientMeasurements
        };

        setActivePatient(patient);
        addRecentPatient(patient);
        setSelectedPatientId(patientId);
      } else {
        setActivePatient(null);
        throw new Error('Patient not found');
      }
    } catch (err) {
      console.error('Error loading patient:', err);
      setError(err instanceof Error ? err : new Error('Failed to load patient'));
      toast({
        title: 'Error',
        description: 'Failed to load patient data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update selected patient ID
  const handleSelectPatient = (patientId: string | null) => {
    setSelectedPatientId(patientId);
    if (patientId) {
      loadPatientById(patientId);
    }
  };

  // Start a patient session
  const startPatientSession = (patient: Patient) => {
    setActivePatient(patient);
    addRecentPatient(patient);
    setSelectedPatientId(patient.id);
  };

  // End a patient session
  const endPatientSession = () => {
    setActivePatient(null);
    setSelectedPatientId(null);
    storageUtils.removeSessionItem('activePatient');
  };

  // Add a patient to the recent patients list
  const addRecentPatient = (patient: Patient) => {
    if (!patient) return;

    // Remove the patient if it's already in the list to avoid duplicates
    const filteredRecentPatients = recentPatients.filter(p => p.id !== patient.id);
    
    // Add the patient to the beginning of the array
    const updatedRecentPatients = [patient, ...filteredRecentPatients].slice(0, 5);
    
    setRecentPatients(updatedRecentPatients);
    storageUtils.setLocalItem('recentPatients', updatedRecentPatients);
  };

  return {
    activePatient,
    setActivePatient,
    selectedPatientId,
    handleSelectPatient,
    recentPatients,
    isPatientActive: !!activePatient,
    startPatientSession,
    endPatientSession,
    loadPatientById,
    addRecentPatient,
    isLoading,
    error
  };
};
