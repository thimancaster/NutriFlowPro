import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';
import { PatientContextType } from './types';

// Session storage keys
const SESSION_KEYS = {
  ACTIVE_PATIENT: 'nutriflow_active_patient',
  SESSION_DATA: 'nutriflow_session_data',
  RECENT_PATIENTS: 'nutriflow_recent_patients'
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatient, setActivePatientState] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionData, setSessionData] = useState({
    consultationActive: false,
    currentStep: 'patient-selection',
    lastActivity: null as Date | null
  });

  const { toast } = useToast();

  // Função para carregar todos os pacientes
  const refreshPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await PatientService.getPatients();
      
      if (result.success && result.data) {
        setPatients(result.data.patients || []);
        setTotalPatients(result.data.total || 0);
      } else {
        throw new Error(result.error || 'Failed to load patients');
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    refreshPatients();
  }, [refreshPatients]);

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

  const startPatientSession = useCallback((patient: Patient) => {
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
  }, [setActivePatient, toast]);

  const endPatientSession = useCallback(() => {
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
  }, [setActivePatient, toast]);

  const loadPatientById = useCallback(async (patientId: string) => {
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
  }, [setActivePatient, toast]);

  const addRecentPatient = useCallback((patient: Patient) => {
    setRecentPatients(prev => {
      const filtered = prev.filter(p => p.id !== patient.id);
      return [patient, ...filtered].slice(0, 5);
    });
  }, []);

  const updateSessionData = useCallback((data: Partial<PatientContextState['sessionData']>) => {
    setSessionData(prev => ({ ...prev, ...data }));
  }, []);

  const savePatient = useCallback(async (patientData: Partial<Patient>) => {
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
  }, [activePatient, setActivePatient, addRecentPatient, refreshPatients, toast]);

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
    startPatientSession,
    endPatientSession,
    loadPatientById,
    addRecentPatient,
    updateSessionData,
    savePatient,
    refreshPatients,
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
