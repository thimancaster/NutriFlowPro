import { useState } from 'react';
import { ConsultationData, Profile } from '@/types';

// Helper function to calculate age
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const useConsultationData = () => {
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    activity_level: 'moderado',
    objective: 'manutencao'
  });

  const updateConsultationData = (data: Partial<ConsultationData>) => {
    setConsultationData(prev => {
      const updated = { ...prev, ...data };
      
      // Ensure gender is properly typed
      if (data.gender) {
        updated.gender = data.gender as 'male' | 'female' | 'other';
      }
      
      // Ensure objective is properly typed
      if (data.objective) {
        updated.objective = data.objective as 'manutencao' | 'emagrecimento' | 'hipertrofia' | 'manutenção' | 'personalizado';
      }
      
      return updated;
    });
  };

  const resetConsultationData = () => {
    setConsultationData({
      weight: 0,
      height: 0,
      age: 0,
      gender: 'male',
      activity_level: 'moderado',
      objective: 'manutencao'
    });
  };

  const loadPatientData = (patient: any) => {
    const genderMap = {
      'M': 'male' as const,
      'F': 'female' as const,
      'male': 'male' as const,
      'female': 'female' as const,
      'other': 'other' as const
    };

    setConsultationData(prev => ({
      ...prev,
      gender: genderMap[patient.gender as keyof typeof genderMap] || 'other',
      age: patient.age || calculateAge(patient.birth_date) || 0,
      weight: patient.weight || 0,
      height: patient.height || 0,
    }));
  };

  return {
    consultationData,
    setConsultationData: updateConsultationData,
    resetConsultationData,
    loadPatientData
  };
};
