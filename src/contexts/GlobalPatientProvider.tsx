import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Patient } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Estado global do ecossistema de pacientes
interface GlobalPatientState {
  // Pacientes
  patients: Patient[];
  activePatient: Patient | null;
  filteredPatients: Patient[];
  
  // Estados de carregamento
  isLoading: boolean;
  isLoadingPatients: boolean;
  
  // Filtros e paginação
  filters: {
    search: string;
    status: 'active' | 'archived' | 'all';
  };
  
  // Estados de erro
  error: string | null;
  
  // Controle de integridade
  lastSync: Date | null;
  isEcosystemHealthy: boolean;
}

type GlobalPatientAction =
  | { type: 'SET_PATIENTS'; payload: Patient[] }
  | { type: 'SET_ACTIVE_PATIENT'; payload: Patient | null }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: { id: string; updates: Partial<Patient> } }
  | { type: 'REMOVE_PATIENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_PATIENTS'; payload: boolean }
  | { type: 'SET_FILTERS'; payload: Partial<GlobalPatientState['filters']> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'VALIDATE_ECOSYSTEM' };

const initialState: GlobalPatientState = {
  patients: [],
  activePatient: null,
  filteredPatients: [],
  isLoading: false,
  isLoadingPatients: false,
  filters: {
    search: '',
    status: 'active'
  },
  error: null,
  lastSync: null,
  isEcosystemHealthy: true
};

function globalPatientReducer(state: GlobalPatientState, action: GlobalPatientAction): GlobalPatientState {
  switch (action.type) {
    case 'SET_PATIENTS':
      return {
        ...state,
        patients: action.payload,
        filteredPatients: filterPatients(action.payload, state.filters),
        lastSync: new Date()
      };
    
    case 'SET_ACTIVE_PATIENT':
      return {
        ...state,
        activePatient: action.payload
      };
    
    case 'ADD_PATIENT':
      const newPatients = [...state.patients, action.payload];
      return {
        ...state,
        patients: newPatients,
        filteredPatients: filterPatients(newPatients, state.filters)
      };
    
    case 'UPDATE_PATIENT':
      const updatedPatients = state.patients.map(patient =>
        patient.id === action.payload.id
          ? { ...patient, ...action.payload.updates }
          : patient
      );
      return {
        ...state,
        patients: updatedPatients,
        filteredPatients: filterPatients(updatedPatients, state.filters),
        activePatient: state.activePatient?.id === action.payload.id
          ? { ...state.activePatient, ...action.payload.updates }
          : state.activePatient
      };
    
    case 'REMOVE_PATIENT':
      const remainingPatients = state.patients.filter(p => p.id !== action.payload);
      return {
        ...state,
        patients: remainingPatients,
        filteredPatients: filterPatients(remainingPatients, state.filters),
        activePatient: state.activePatient?.id === action.payload ? null : state.activePatient
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_LOADING_PATIENTS':
      return {
        ...state,
        isLoadingPatients: action.payload
      };
    
    case 'SET_FILTERS':
      const newFilters = { ...state.filters, ...action.payload };
      return {
        ...state,
        filters: newFilters,
        filteredPatients: filterPatients(state.patients, newFilters)
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    
    case 'SET_LAST_SYNC':
      return {
        ...state,
        lastSync: action.payload
      };
    
    case 'VALIDATE_ECOSYSTEM':
      return {
        ...state,
        isEcosystemHealthy: validateEcosystemHealth(state)
      };
    
    default:
      return state;
  }
}

// Função auxiliar para filtrar pacientes
function filterPatients(patients: Patient[], filters: GlobalPatientState['filters']): Patient[] {
  return patients.filter(patient => {
    // Filtro de status
    if (filters.status !== 'all' && patient.status !== filters.status) {
      return false;
    }
    
    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        patient.name.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.phone?.includes(filters.search) ||
        patient.cpf?.includes(filters.search)
      );
    }
    
    return true;
  });
}

// Função auxiliar para validar saúde do ecossistema
function validateEcosystemHealth(state: GlobalPatientState): boolean {
  // Verificar se não há dados corrompidos
  const hasValidPatients = state.patients.every(patient => 
    patient.id && patient.name && patient.user_id
  );
  
  // Verificar se o paciente ativo é válido
  const isActivePatientValid = !state.activePatient || 
    (state.activePatient.id && state.activePatient.user_id);
  
  // Verificar se não há erro crítico
  const hasNoCriticalError = !state.error || !state.error.includes('crítico');
  
  return hasValidPatients && isActivePatientValid && hasNoCriticalError;
}

interface GlobalPatientContextType extends GlobalPatientState {
  // Ações de pacientes
  setPatients: (patients: Patient[]) => void;
  setActivePatient: (patient: Patient | null) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  removePatient: (id: string) => void;
  
  // Ações de estado
  setLoading: (loading: boolean) => void;
  setLoadingPatients: (loading: boolean) => void;
  setFilters: (filters: Partial<GlobalPatientState['filters']>) => void;
  setError: (error: string | null) => void;
  
  // Ações de integridade
  validateEcosystem: () => void;
  refreshPatients: () => Promise<void>;
  
  // Utilitários
  getPatientById: (id: string) => Patient | undefined;
  ensurePatientIntegrity: (patient: Patient) => Patient;
}

const GlobalPatientContext = createContext<GlobalPatientContextType | undefined>(undefined);

export const GlobalPatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalPatientReducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Garantir que o paciente tenha dados íntegros
  const ensurePatientIntegrity = useCallback((patient: Patient): Patient => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }
    
    return {
      ...patient,
      user_id: user.id, // Sempre garantir que o user_id está correto
      status: patient.status || 'active' // Garantir status padrão
    };
  }, [user?.id]);

  // Ações de pacientes
  const setPatients = useCallback((patients: Patient[]) => {
    try {
      const validatedPatients = patients.map(ensurePatientIntegrity);
      dispatch({ type: 'SET_PATIENTS', payload: validatedPatients });
    } catch (error: any) {
      console.error('Error setting patients:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [ensurePatientIntegrity]);

  const setActivePatient = useCallback((patient: Patient | null) => {
    try {
      if (patient) {
        const validatedPatient = ensurePatientIntegrity(patient);
        dispatch({ type: 'SET_ACTIVE_PATIENT', payload: validatedPatient });
        
        // Salvar no localStorage para persistência
        localStorage.setItem('globalActivePatient', JSON.stringify(validatedPatient));
      } else {
        dispatch({ type: 'SET_ACTIVE_PATIENT', payload: null });
        localStorage.removeItem('globalActivePatient');
      }
    } catch (error: any) {
      console.error('Error setting active patient:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [ensurePatientIntegrity]);

  const addPatient = useCallback((patient: Patient) => {
    try {
      const validatedPatient = ensurePatientIntegrity(patient);
      dispatch({ type: 'ADD_PATIENT', payload: validatedPatient });
    } catch (error: any) {
      console.error('Error adding patient:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [ensurePatientIntegrity]);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    dispatch({ type: 'UPDATE_PATIENT', payload: { id, updates } });
  }, []);

  const removePatient = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PATIENT', payload: id });
  }, []);

  // Ações de estado
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setLoadingPatients = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING_PATIENTS', payload: loading });
  }, []);

  const setFilters = useCallback((filters: Partial<GlobalPatientState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // Ações de integridade
  const validateEcosystem = useCallback(() => {
    dispatch({ type: 'VALIDATE_ECOSYSTEM' });
  }, []);

  const refreshPatients = useCallback(async () => {
    if (!user?.id || !isAuthenticated) return;
    
    setLoadingPatients(true);
    try {
      // Aqui seria implementada a busca real de pacientes
      // Por agora, validamos o ecossistema atual
      validateEcosystem();
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
    } catch (error: any) {
      console.error('Error refreshing patients:', error);
      setError(error.message);
    } finally {
      setLoadingPatients(false);
    }
  }, [user?.id, isAuthenticated, setLoadingPatients, validateEcosystem, setError]);

  // Utilitários
  const getPatientById = useCallback((id: string): Patient | undefined => {
    return state.patients.find(p => p.id === id);
  }, [state.patients]);

  // Restaurar estado do localStorage
  useEffect(() => {
    try {
      const savedActivePatient = localStorage.getItem('globalActivePatient');
      if (savedActivePatient) {
        const patient = JSON.parse(savedActivePatient);
        if (patient.user_id === user?.id) {
          dispatch({ type: 'SET_ACTIVE_PATIENT', payload: patient });
        } else {
          localStorage.removeItem('globalActivePatient');
        }
      }
    } catch (error) {
      console.error('Error restoring active patient:', error);
      localStorage.removeItem('globalActivePatient');
    }
  }, [user?.id]);

  // Validar ecossistema periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      validateEcosystem();
    }, 30000); // Validar a cada 30 segundos

    return () => clearInterval(interval);
  }, [validateEcosystem]);

  // Alertar sobre problemas de integridade
  useEffect(() => {
    if (!state.isEcosystemHealthy && state.error) {
      toast({
        title: 'Problema de Integridade',
        description: state.error,
        variant: 'destructive'
      });
    }
  }, [state.isEcosystemHealthy, state.error, toast]);

  const contextValue: GlobalPatientContextType = {
    ...state,
    setPatients,
    setActivePatient,
    addPatient,
    updatePatient,
    removePatient,
    setLoading,
    setLoadingPatients,
    setFilters,
    setError,
    validateEcosystem,
    refreshPatients,
    getPatientById,
    ensurePatientIntegrity
  };

  return (
    <GlobalPatientContext.Provider value={contextValue}>
      {children}
    </GlobalPatientContext.Provider>
  );
};

export const useGlobalPatient = () => {
  const context = useContext(GlobalPatientContext);
  if (context === undefined) {
    throw new Error('useGlobalPatient must be used within a GlobalPatientProvider');
  }
  return context;
};