import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Patient, AddressDetails } from '@/types';
import { storageUtils } from '@/utils/storageUtils';
import { supabase } from '@/integrations/supabase/client';

interface PatientContextType {
  activePatient: Patient | null;
  setActivePatient: (patient: Patient | null) => void;
  isPatientActive: boolean;
  startPatientSession: (patient: Patient) => void;
  endPatientSession: () => void;
  loadPatientById: (patientId: string) => Promise<void>;
  recentPatients: Patient[];
  selectedPatientId: string | null;
  isLoading: boolean;
  error: Error | null;
  addRecentPatient: (patient: Patient) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Load patient by ID from the database
  const loadPatientById = async (patientId: string) => {
    if (!patientId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (supabaseError) throw supabaseError;

      if (data) {
        // Process address data properly
        let addressData: string | AddressDetails | undefined;
        
        if (data.address) {
          if (typeof data.address === 'string') {
            try {
              // Try to parse the address as JSON if it's a string
              addressData = JSON.parse(data.address as string) as AddressDetails;
            } catch (e) {
              // If parsing fails, keep it as a string
              addressData = data.address as string;
            }
          } else if (typeof data.address === 'object') {
            // If it's already an object, use it directly
            addressData = data.address as AddressDetails;
          }
        }

        // Process database data into our Patient type
        const patient: Patient = {
          ...data,
          status: (data.status as 'active' | 'archived') || 'active',
          gender: (data.gender as 'male' | 'female' | 'other') || undefined,
          goals: (data.goals as Record<string, any>) || {},
          measurements: (data.measurements as Record<string, any>) || {},
          address: addressData
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

  const contextValue: PatientContextType = {
    activePatient,
    setActivePatient,
    selectedPatientId,
    recentPatients,
    isPatientActive: !!activePatient,
    startPatientSession,
    endPatientSession,
    loadPatientById,
    addRecentPatient,
    isLoading,
    error
  };

  return (
    <PatientContext.Provider value={contextValue}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
