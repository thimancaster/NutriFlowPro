
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PatientService } from '@/services/patient';
import { Patient, AddressDetails } from '@/types';

interface UsePatientFormSubmitProps {
  editPatient?: Patient;
  onSuccess?: () => void;
  userId: string;
  validateForm: (formData: any, birthDate?: Date | undefined, address?: AddressDetails) => boolean;
  formData: any;
  birthDate?: Date | undefined;
  address: AddressDetails;
  notes: string;
}

export const usePatientFormSubmit = ({
  editPatient,
  onSuccess,
  userId,
  validateForm,
  formData,
  birthDate,
  address,
  notes
}: UsePatientFormSubmitProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData, birthDate, address)) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os campos destacados.",
        variant: "destructive",
      });
      return;
    }
    
    if (!userId) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para cadastrar pacientes.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Format birth_date for database
      const formattedBirthDate = birthDate ? 
        birthDate.toISOString().split('T')[0] : null;
      
      // Format data for Supabase
      const patientData: Partial<Patient> = {
        name: formData.name,
        gender: formData.sex,
        birth_date: formattedBirthDate, // Store as string in DB format
        email: formData.email || null,
        phone: formData.phone || null,
        secondaryPhone: formData.secondaryPhone || null,
        cpf: formData.cpf || null,
        user_id: userId,
        status: formData.status,
        // Use address as an object rather than string
        address: Object.values(address).some(value => value) ? address : null,
        notes: notes || null,
        goals: {
          objective: formData.objective,
          profile: formData.profile,
        },
      };

      console.log('Submitting patient data:', patientData);

      let result;
      
      if (editPatient) {
        // Use the PatientService to update existing patient
        result = await PatientService.savePatient({
          ...patientData,
          id: editPatient.id
        });
      } else {
        // Use the PatientService to insert new patient
        result = await PatientService.savePatient(patientData);
      }
      
      if (!result.success) {
        throw new Error(result.error || "Falha ao salvar paciente");
      }
      
      toast({
        title: editPatient ? "Paciente atualizado" : "Paciente cadastrado",
        description: `${formData.name} foi ${editPatient ? 'atualizado' : 'adicionado(a)'} com sucesso.`,
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error saving patient:", error);
      toast({
        title: "Erro ao salvar paciente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit
  };
};
