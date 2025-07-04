import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PatientDataService, PatientCompleteData } from '@/services/patient/PatientDataService';
import { useAuth } from '@/contexts/auth/AuthContext';

interface UsePatientDataLoaderOptions {
  patientId?: string;
  enabled?: boolean;
  refetchOnMount?: boolean;
  cacheTime?: number;
}

export const usePatientDataLoader = (options: UsePatientDataLoaderOptions = {}) => {
  const { user } = useAuth();
  const { patientId, enabled = true, refetchOnMount = true, cacheTime = 5 * 60 * 1000 } = options;

  const [lastLoadedPatientId, setLastLoadedPatientId] = useState<string | null>(null);

  const queryKey = ['patient-complete-data', user?.id, patientId];

  const {
    data: completeData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<PatientCompleteData | null> => {
      if (!user?.id || !patientId) {
        throw new Error('User ID or Patient ID not available');
      }

      console.log('Loading complete patient data via usePatientDataLoader:', patientId);
      
      const data = await PatientDataService.getCompletePatientData(
        user.id, 
        patientId, 
        refetchOnMount && lastLoadedPatientId !== patientId
      );

      if (data) {
        setLastLoadedPatientId(patientId);
      }

      return data;
    },
    enabled: enabled && !!user?.id && !!patientId,
    staleTime: cacheTime,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Derived data for easier access
  const patient = completeData?.patient || null;
  const anthropometryHistory = completeData?.anthropometryHistory || [];
  const consultationHistory = completeData?.consultationHistory || [];
  const lastMeasurement = completeData?.lastMeasurement || null;
  const lastConsultation = completeData?.lastConsultation || null;

  // Helper methods
  const getLatestMeasurements = useCallback(() => {
    if (!lastMeasurement) return {};
    
    return {
      weight: lastMeasurement.weight,
      height: lastMeasurement.height,
      imc: lastMeasurement.imc,
      bodyFat: lastMeasurement.body_fat_pct,
      muscleMass: lastMeasurement.muscle_mass_percentage,
      waterPercentage: lastMeasurement.water_percentage
    };
  }, [lastMeasurement]);

  const getFormPrefilledData = useCallback(() => {
    if (!patient) return {};

    const latestMeasurements = getLatestMeasurements();
    
    return {
      // Patient basic info
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender,
      age: patient.age,
      birth_date: patient.birth_date,
      
      // Latest measurements
      weight: latestMeasurements.weight,
      height: latestMeasurements.height,
      
      // Last consultation data
      activity_level: lastConsultation?.activity_level || 'moderado',
      objective: lastConsultation?.objective || patient.goals?.objective || 'manutenção',
      
      // Goals from patient profile (using any to handle dynamic goal structure)
      goalWeight: (patient.goals as any)?.weight,
      goalCalories: (patient.goals as any)?.calories,
      goalProtein: (patient.goals as any)?.protein,
      goalCarbs: (patient.goals as any)?.carbs,
      goalFats: (patient.goals as any)?.fats,
    };
  }, [patient, lastMeasurement, lastConsultation, getLatestMeasurements]);

  const hasHistoricalData = !!(
    anthropometryHistory.length > 0 || 
    consultationHistory.length > 0
  );

  const isFirstConsultation = consultationHistory.length === 0;

  // Force refresh function
  const forceRefresh = useCallback(async () => {
    if (user?.id && patientId) {
      PatientDataService.clearCache(user.id, patientId);
      await refetch();
    }
  }, [user?.id, patientId, refetch]);

  // Clear cache when patient changes
  useEffect(() => {
    if (patientId && lastLoadedPatientId && patientId !== lastLoadedPatientId) {
      if (user?.id) {
        PatientDataService.clearCache(user.id, lastLoadedPatientId);
      }
    }
  }, [patientId, lastLoadedPatientId, user?.id]);

  return {
    // Complete data
    completeData,
    
    // Individual data sections
    patient,
    anthropometryHistory,
    consultationHistory,
    lastMeasurement,
    lastConsultation,
    
    // Loading states
    isLoading,
    isFetching,
    isError,
    error,
    
    // Helper data
    hasHistoricalData,
    isFirstConsultation,
    
    // Helper methods
    getLatestMeasurements,
    getFormPrefilledData,
    forceRefresh,
    refetch,
    
    // Status info
    isDataAvailable: !!completeData,
    hasAnthropometryHistory: anthropometryHistory.length > 0,
    hasConsultationHistory: consultationHistory.length > 0,
  };
};

export default usePatientDataLoader;