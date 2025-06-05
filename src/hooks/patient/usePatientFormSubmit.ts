
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PatientService } from '@/services/patient';
import { Patient, AddressDetails } from '@/types';
import { csrfProtection, rateLimiter } from '@/utils/securityValidation';

interface UsePatientFormSubmitProps {
  editPatient?: Patient;
  onSuccess?: () => void;
  userId: string;
  validateAndSanitizeForm: (formData: any, birthDate?: Date | undefined, address?: AddressDetails) => {
    isValid: boolean;
    errors: Record<string, string>;
    sanitizedData: any;
  };
  formData: any;
  birthDate?: Date | undefined;
  address: AddressDetails;
  notes: string;
}

export const usePatientFormSubmit = ({
  editPatient,
  onSuccess,
  userId,
  validateAndSanitizeForm,
  formData,
  birthDate,
  address,
  notes
}: UsePatientFormSubmitProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', { formData, birthDate, address, notes });
    
    // Rate limiting for patient creation/updates
    const rateLimitKey = editPatient ? `patient_update_${editPatient.id}` : `patient_create_${userId}`;
    const rateCheck = rateLimiter.checkLimit(rateLimitKey, 5, 60000); // 5 attempts per minute
    
    if (!rateCheck.allowed) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde um momento antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate and sanitize form data
    const validation = validateAndSanitizeForm(formData, birthDate, address);
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.log('Form validation failed:', validation.errors);
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
      // Use sanitized data from validation
      const sanitizedFormData = validation.sanitizedData;
      
      // Format birth_date for database
      const formattedBirthDate = birthDate ? 
        birthDate.toISOString().split('T')[0] : null;
      
      // Ensure gender is in the correct format for the database constraint
      let genderValue: 'male' | 'female' | 'other' | undefined;
      if (sanitizedFormData.sex === 'M') {
        genderValue = 'male';
      } else if (sanitizedFormData.sex === 'F') {
        genderValue = 'female';
      } else if (sanitizedFormData.sex === 'O') {
        genderValue = 'other';
      } else {
        genderValue = undefined;
      }
      
      // Format data for Supabase with CSRF protection
      let patientData: Partial<Patient> = {
        name: sanitizedFormData.name,
        gender: genderValue,
        birth_date: formattedBirthDate,
        email: sanitizedFormData.email || null,
        phone: sanitizedFormData.phone || null,
        secondaryPhone: sanitizedFormData.secondaryPhone || null,
        cpf: sanitizedFormData.cpf || null,
        user_id: userId,
        status: sanitizedFormData.status || 'active',
        address: Object.values(address || {}).some(value => value) ? address : null,
        notes: notes || null,
        goals: {
          objective: sanitizedFormData.objective,
          profile: sanitizedFormData.profile,
        },
      };

      // Add CSRF protection
      patientData = csrfProtection.attachToken(patientData);

      console.log('Submitting sanitized patient data:', patientData);

      let result;
      
      if (editPatient) {
        result = await PatientService.updatePatient(editPatient.id, userId, patientData);
      } else {
        result = await PatientService.savePatient(patientData);
      }
      
      console.log('Save result:', result);
      
      if (!result.success) {
        throw new Error(result.error || "Falha ao salvar paciente");
      }
      
      toast({
        title: editPatient ? "Paciente atualizado" : "Paciente cadastrado",
        description: `${sanitizedFormData.name} foi ${editPatient ? 'atualizado' : 'adicionado(a)'} com sucesso.`,
      });
      
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
