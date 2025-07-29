
import { usePatient } from '@/contexts/patient/PatientContext';

/**
 * Unified hook to access active patient data
 * Replaces all local useState<Patient> usage
 */
export const useActivePatient = () => {
  const {
    activePatient,
    isPatientActive,
    setActivePatient,
    startPatientSession,
    endPatientSession,
    loadPatientById,
    patientHistoryData,
    loadPatientHistory,
    isLoading,
    error
  } = usePatient();

  return {
    // Patient data
    patient: activePatient,
    activePatient,
    selectedPatient: activePatient, // Alias for compatibility
    
    // State
    isPatientActive,
    isLoading,
    error,
    
    // History data (centralized)
    patientHistoryData,
    
    // Actions
    setActivePatient,
    setSelectedPatient: setActivePatient, // Alias for compatibility
    selectPatient: startPatientSession,
    startPatientSession,
    endPatientSession,
    loadPatientById,
    loadPatientHistory,
    
    // Computed properties
    patientId: activePatient?.id,
    patientName: activePatient?.name,
    hasActivePatient: isPatientActive
  };
};
