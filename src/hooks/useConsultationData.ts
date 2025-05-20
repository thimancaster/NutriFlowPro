
import { useState } from 'react';
import { ConsultationData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useConsultationData = () => {
  const [consultation, setConsultation] = useState<ConsultationData>({
    id: uuidv4(),
    patient_id: '',
    patient: { name: '' },
    weight: 0,
    height: 0,
    age: 0,
    gender: 'female',
    activity_level: 'moderado',
    goal: 'manutenção',
    bmr: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    results: {
      bmr: 0,
      get: 0,
      vet: 0,
      adjustment: 0,
      macros: {
        protein: 0,
        carbs: 0,
        fat: 0
      }
    }
  });

  const setNutritionalConsultation = (data: Partial<ConsultationData>) => {
    setConsultation(prev => ({ ...prev, ...data }));
  };

  // Method to create a new consultation
  const createNewConsultation = (patientId: string, patientName: string) => {
    const newConsultation: ConsultationData = {
      id: uuidv4(),
      patient_id: patientId,
      patient: { name: patientName },
      weight: 0,
      height: 0,
      age: 0,
      gender: 'female',
      activity_level: 'moderado',
      goal: 'manutenção',
      bmr: 0,
      tdee: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      notes: '',
      objective: 'manutenção',
      results: {
        bmr: 0,
        get: 0,
        vet: 0,
        adjustment: 0,
        macros: {
          protein: 0,
          carbs: 0,
          fat: 0
        }
      }
    };
    
    setConsultation(newConsultation);
    return newConsultation;
  };

  return { consultation, setNutritionalConsultation, createNewConsultation };
};
