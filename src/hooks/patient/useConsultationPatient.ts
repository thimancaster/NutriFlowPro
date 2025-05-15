
import { useState, useEffect } from 'react';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { Patient } from '@/types';

export const useConsultationPatient = (patientId?: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const { patients, isLoading: isPatientsLoading } = usePatientOptions();
  
  useEffect(() => {
    if (patientId && patients.length > 0) {
      const foundPatient = patients.find(p => p.id === patientId);
      if (foundPatient) {
        setPatient(foundPatient as Patient);
      }
    }
  }, [patientId, patients]);
  
  return {
    patient,
    patients,
    isPatientsLoading
  };
};
