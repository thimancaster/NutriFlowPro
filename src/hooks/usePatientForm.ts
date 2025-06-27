
// Re-export from the patient directory with integrated context
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Patient } from '@/types';

interface UsePatientFormProps {
  editPatient?: Patient;
  initialData?: any;
  onSuccess?: () => void;
}

export const usePatientForm = ({
  editPatient,
  initialData,
  onSuccess,
}: UsePatientFormProps) => {
  const { user } = useAuth();
  const { savePatient, isLoading, error } = usePatient();

  const handleSubmit = async (formData: any) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    const patientData: Partial<Patient> = {
      ...formData,
      user_id: user.id,
      id: editPatient?.id,
    };

    const result = await savePatient(patientData);
    
    if (result.success) {
      onSuccess?.();
    }
    
    return result;
  };

  return {
    handleSubmit,
    isLoading,
    error,
    savePatient,
  };
};
