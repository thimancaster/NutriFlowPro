
import { ConsultationData } from '@/types';

export const mapSupabaseConsultation = (data: any): ConsultationData => {
  return {
    id: data.id,
    patient_id: data.patient_id,
    weight: data.weight || 0,
    height: data.height || 0,
    bmr: data.bmr || 0,
    protein: data.protein || 0,
    carbs: data.carbs || 0,
    fats: data.fats || 0,
    totalCalories: data.tdee || 0,
    gender: data.gender || 'M',
    activity_level: data.activity_level || 'moderado',
    patient: {
      name: data.patient?.name || 'Paciente',
      id: data.patient_id
    },
    results: data.tdee ? {
      bmr: data.bmr || 0,
      get: data.tdee || 0,
      vet: data.tdee || 0,
      adjustment: 0,
      macros: {
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fats || 0
      }
    } : null
  };
};
