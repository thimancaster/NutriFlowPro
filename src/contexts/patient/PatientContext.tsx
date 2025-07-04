import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient, PatientFilters } from '@/types';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';
import { PatientContextType, PatientContextState } from './types';
import { useAuth } from '@/contexts/auth/AuthContext';

// Session storage keys
const SESSION_KEYS = {
  ACTIVE_PATIENT: 'nutriflow_active_patient',
  SESSION_DATA: 'nutriflow_session_data',
  RECENT_PATIENTS: 'nutriflow_recent_patients'
};

// Create the context
const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activePatient, setActivePatientState] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentFilters, setCurrentFilters] = useState<PatientFilters>({
    status: 'active',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 20
  });
  const [sessionData, setSessionData] = useState({
    consultationActive: false,
    currentStep: 'patient-selection',
    lastActivity: null as Date | null
  });

  const { toast } = useToast();

  // Função para carregar pacientes com filtros
  const refreshPatients = useCallback(async (filters?: PatientFilters) => {
    if (!user?.id) {
      console.log('No user ID available for refreshing patients');
      return;
    }

    const filtersToUse = filters || currentFilters;
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Refreshing patients with filters:', filtersToUse);
      const result = await PatientService.getPatients(
        user.id,
        {
          status: filtersToUse.status || 'active',
          search: filtersToUse.search || '',
          sortBy: filtersToUse.sortBy || 'name',
          sortOrder: filtersToUse.sortOrder || 'asc'
        },
        filtersToUse.page || 1,
        filtersToUse.limit || 20
      );
      
      if (result.success && result.data) {
        console.log('PatientService result:', result.data);
        setPatients(result.data);
        setTotalPatients(result.total || result.data.length);
        console.log('Patients loaded successfully');
      } else {
        throw new Error(result.error || 'Failed to load patients');
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error loading patients:', error);
      setPatients([]);
      setTotalPatients(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentFilters]);

  // Função para atualizar filtros e recarregar
  const updateFilters = useCallback(async (newFilters: Partial<PatientFilters>) => {
    const updatedFilters = { ...currentFilters, ...newFilters };
    setCurrentFilters(updatedFilters);
    await refreshPatients(updatedFilters);
  }, [currentFilters, refreshPatients]);

  // Load session data on mount
  useEffect(() => {
    try {
      const savedPatient = localStorage.getItem(SESSION_KEYS.ACTIVE_PATIENT);
      const savedSession = localStorage.getItem(SESSION_KEYS.SESSION_DATA);
      const savedRecent = localStorage.getItem(SESSION_KEYS.RECENT_PATIENTS);

      if (savedPatient) {
        const patient = JSON.parse(savedPatient);
        setActivePatientState(patient);
        setSelectedPatientId(patient.id);
      }

      if (savedSession) {
        const session = JSON.parse(savedSession);
        setSessionData({
          ...session,
          lastActivity: session.lastActivity ? new Date(session.lastActivity) : null
        });
      }

      if (savedRecent) {
        setRecentPatients(JSON.parse(savedRecent));
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  }, []);

  // Load patients on mount
  useEffect(() => {
    if (user?.id) {
      refreshPatients();
    }
  }, [refreshPatients, user?.id]);

  // Persist session data when it changes
  useEffect(() => {
    if (activePatient) {
      localStorage.setItem(SESSION_KEYS.ACTIVE_PATIENT, JSON.stringify(activePatient));
    } else {
      localStorage.removeItem(SESSION_KEYS.ACTIVE_PATIENT);
    }
  }, [activePatient]);

  useEffect(() => {
    localStorage.setItem(SESSION_KEYS.SESSION_DATA, JSON.stringify({
      ...sessionData,
      lastActivity: sessionData.lastActivity?.toISOString()
    }));
  }, [sessionData]);

  useEffect(() => {
    localStorage.setItem(SESSION_KEYS.RECENT_PATIENTS, JSON.stringify(recentPatients));
  }, [recentPatients]);

  const isPatientActive = activePatient !== null;

  const setActivePatient = useCallback((patient: Patient | null) => {
    setActivePatientState(patient);
    setSelectedPatientId(patient?.id || null);
    
    if (patient) {
      updateSessionData({ 
        lastActivity: new Date(),
        consultationActive: true 
      });
    } else {
      updateSessionData({ 
        consultationActive: false,
        currentStep: 'patient-selection'
      });
    }
  }, []);

  const addRecentPatient = useCallback((patient: Patient) => {
    setRecentPatients(prev => {
      const filtered = prev.filter(p => p.id !== patient.id);
      return [patient, ...filtered].slice(0, 5);
    });
  }, []);

  const updateSessionData = useCallback((data: Partial<PatientContextState['sessionData']>) => {
    setSessionData(prev => ({ ...prev, ...data }));
  }, []);

  const contextValue: PatientContextType = {
    // State
    activePatient,
    isPatientActive,
    selectedPatientId,
    recentPatients,
    patients,
    totalPatients,
    isLoading,
    error,
    sessionData,
    // Actions
    setActivePatient,
    startPatientSession: useCallback((patient: Patient) => {
      setActivePatient(patient);
      addRecentPatient(patient);
      updateSessionData({
        consultationActive: true,
        currentStep: 'patient-info',
        lastActivity: new Date()
      });
      
      toast({
        title: "Sessão iniciada",
        description: `Atendimento de ${patient.name} iniciado com sucesso.`
      });
    }, [setActivePatient, addRecentPatient, updateSessionData, toast]),
    endPatientSession: useCallback(() => {
      setActivePatient(null);
      updateSessionData({
        consultationActive: false,
        currentStep: 'patient-selection',
        lastActivity: new Date()
      });
      
      toast({
        title: "Sessão encerrada",
        description: "Atendimento finalizado com sucesso."
      });
    }, [setActivePatient, updateSessionData, toast]),
    loadPatientById: useCallback(async (patientId: string) => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await PatientService.getPatient(patientId);
        
        if (result.success && result.data) {
          setActivePatient(result.data);
          return;
        }
        
        throw new Error(result.error || 'Failed to load patient');
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }, [setActivePatient, toast, user?.id]),
    addRecentPatient,
    updateSessionData,
    savePatient: useCallback(async (patientData: Partial<Patient>) => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Saving patient data:', patientData);
        
        const result = await PatientService.savePatient(patientData);
        
        if (result.success && result.data) {
          // Update active patient if this is the same patient
          if (activePatient && activePatient.id === result.data.id) {
            setActivePatient(result.data);
          }
          
          // Add to recent patients
          addRecentPatient(result.data);
          
          // Refresh patients list
          await refreshPatients();
          
          toast({
            title: "Sucesso",
            description: `Paciente ${result.data.name} salvo com sucesso.`
          });
          
          return result;
        }
        
        throw new Error(result.error || 'Falha ao salvar paciente');
      } catch (err) {
        const error = err as Error;
        setError(error);
        
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive"
        });
        
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    }, [activePatient, setActivePatient, addRecentPatient, refreshPatients, toast]),
    refreshPatients,
    updateFilters,
    currentFilters,
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
