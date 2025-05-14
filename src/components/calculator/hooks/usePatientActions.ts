
import { useState } from 'react';
import { PatientService } from '@/services/patient';
import { ToastApi } from '../types';

interface UsePatientActionsProps {
  toast: ToastApi;
}

export const usePatientActions = ({ toast }: UsePatientActionsProps) => {
  const [isSavingPatient, setIsSavingPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Save patient function
  const savePatient = async (patientData: any) => {
    try {
      const result = await PatientService.savePatient(patientData, patientData.user_id);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Function to handle meal plan generation
  const handleGenerateMealPlan = async () => {
    // Implementation can be added as needed
    toast.toast({
      title: "Plano de refeições",
      description: "Funcionalidade em desenvolvimento."
    });
    return true;
  };

  // Add handleSavePatient that will be exported
  const handleSavePatient = savePatient;

  return {
    selectedPatient,
    setSelectedPatient,
    savePatient,
    isLoading: isSavingPatient,
    handleSavePatient,
    handleGenerateMealPlan,
    isSavingPatient
  };
};
