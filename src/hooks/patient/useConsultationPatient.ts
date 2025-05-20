
import { useState, useEffect, useMemo } from 'react';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { Patient } from '@/types';

export const useConsultationPatient = (patientId?: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const { patients, isLoading: isPatientsLoading } = usePatientOptions();
  
  // Use useMemo para evitar cálculos repetidos
  const foundPatient = useMemo(() => {
    if (!patientId || !patients.length) return null;
    return patients.find(p => p.id === patientId) || null;
  }, [patientId, patients]);
  
  // Atualize o estado apenas se ele mudar
  useEffect(() => {
    if (foundPatient && (!patient || patient.id !== foundPatient.id)) {
      setPatient(foundPatient as Patient);
    }
  }, [foundPatient, patient]);
  
  return {
    patient,
    patients,
    isPatientsLoading
  };
};

export default useConsultationPatient;
