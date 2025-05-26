
import React from 'react';
import ConsultationForm from './ConsultationForm';
import { useConsultationForm } from '@/hooks/useConsultationForm';
import { ConsultationData } from '@/types';
import { Patient } from '@/types/patient';
import { Sex, Objective, Profile, ActivityLevel, ConsultationType, ConsultationStatus } from '@/types/consultation';

interface PatientOption {
  id: string;
  name: string;
  email?: string;
}

interface ConsultationFormWrapperProps {
  consultation: ConsultationData;
  onFormChange: (data: Partial<ConsultationData>) => void;
  patient: Patient | null;
  patients: PatientOption[];
  autoSaveStatus?: "idle" | "saving" | "success" | "error";
}

const ConsultationFormWrapper: React.FC<ConsultationFormWrapperProps> = ({ 
  consultation, 
  onFormChange, 
  patient, 
  patients,
  autoSaveStatus 
}) => {
  // Initialize form with consultation data, ensuring proper types
  const initialData = {
    weight: consultation.weight?.toString() || '',
    height: consultation.height?.toString() || '',
    age: consultation.age?.toString() || '',
    sex: (consultation.gender === 'male' ? 'M' : 'F') as Sex,
    objective: (consultation.objective || consultation.goal || 'manutenção') as Objective,
    profile: 'eutrofico' as Profile, // Default profile
    activityLevel: (consultation.activity_level || 'moderado') as ActivityLevel,
    consultationType: 'primeira_consulta' as ConsultationType,
    consultationStatus: 'em_andamento' as ConsultationStatus,
  };

  const { 
    formData,
    results,
    handleInputChange,
    handleSelectChange,
    lastAutoSave,
    setLastAutoSave
  } = useConsultationForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update consultation with form data
    onFormChange({
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      age: parseInt(formData.age),
      gender: formData.sex === 'M' ? 'male' : 'female',
      activity_level: formData.activityLevel,
      objective: formData.objective,
      results: {
        bmr: results.tmb,
        get: results.get,
        vet: results.fa,
        adjustment: 0,
        macros: {
          protein: results.macros.protein,
          carbs: results.macros.carbs,
          fat: results.macros.fat
        }
      },
      protein: results.macros.protein,
      carbs: results.macros.carbs,
      fats: results.macros.fat
    });
    
    // Update last autosave time
    setLastAutoSave(new Date());
  };

  return (
    <ConsultationForm
      formData={formData}
      handleInputChange={handleInputChange}
      handleSelectChange={handleSelectChange}
      onSubmit={handleSubmit}
      lastAutoSave={lastAutoSave}
      autoSaveStatus={autoSaveStatus}
    />
  );
};

export default ConsultationFormWrapper;
