import { useEffect } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';

export const useDebugPatients = () => {
  const { patients, totalPatients, isLoading, error, currentFilters } = usePatient();

  useEffect(() => {
    console.log('🔍 DEBUG Patient Context State:');
    console.log('- Patients count:', patients.length);
    console.log('- Total patients:', totalPatients);
    console.log('- Is loading:', isLoading);
    console.log('- Error:', error?.message);
    console.log('- Current filters:', currentFilters);
    console.log('- Patients data:', patients);
  }, [patients, totalPatients, isLoading, error, currentFilters]);

  return {
    patients,
    totalPatients,
    isLoading,
    error,
    currentFilters
  };
};