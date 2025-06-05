
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PatientService } from '@/services/patient';
import { Patient, AddressDetails } from '@/types';
import { enhancedCsrfProtection, enhancedRateLimiter } from '@/utils/enhancedSecurityValidation';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { logSecurityEvent, SecurityEvents } from '@/utils/auditLogger';

interface UsePatientFormSubmitProps {
  editPatient?: Patient;
  onSuccess?: () => void;
  userId: string;
  validateAndSanitizeForm: (formData: any, birthDate?: Date | undefined, address?: AddressDetails) => Promise<{
    isValid: boolean;
    errors: Record<string, string>;
    sanitizedData: any;
  }>;
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
  const { validatePatientData, checkQuota } = useSecurityValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with enhanced security validation:', { formData, birthDate, address, notes });
    
    // Enhanced rate limiting with server-side tracking
    const rateLimitKey = editPatient ? `patient_update_${editPatient.id}` : `patient_create`;
    const rateCheck = await enhancedRateLimiter.checkLimit(userId, rateLimitKey, 5);
    
    if (!rateCheck.allowed) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde um momento antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }

    // Check premium quota for new patients
    if (!editPatient) {
      const quotaCheck = await checkQuota('patients', 'create');
      if (!quotaCheck.canAccess) {
        toast({
          title: "Limite atingido",
          description: quotaCheck.reason || "Limite de pacientes atingido para sua conta.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Enhanced client and server-side validation
    const validation = await validateAndSanitizeForm(formData, birthDate, address);
    console.log('Client validation result:', validation);
    
    if (!validation.isValid) {
      console.log('Client validation failed:', validation.errors);
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os campos destacados.",
        variant: "destructive",
      });
      return;
    }

    // Server-side validation for critical fields
    const serverValidation = await validatePatientData(
      validation.sanitizedData.name,
      validation.sanitizedData.email,
      validation.sanitizedData.phone,
      validation.sanitizedData.cpf
    );

    if (!serverValidation.isValid) {
      console.log('Server validation failed:', serverValidation.errors);
      toast({
        title: "Dados inválidos",
        description: "Verifique os dados informados.",
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
      
      // Format data for Supabase with enhanced CSRF protection
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

      // Add enhanced CSRF protection
      patientData = enhancedCsrfProtection.attachToken(patientData);

      console.log('Submitting sanitized patient data:', patientData);

      let result;
      
      if (editPatient) {
        result = await PatientService.updatePatient(editPatient.id, userId, patientData);
        
        // Log security event for patient update
        await logSecurityEvent(userId, {
          eventType: SecurityEvents.PATIENT_UPDATED,
          eventData: { patientId: editPatient.id, patientName: sanitizedFormData.name }
        });
      } else {
        result = await PatientService.savePatient(patientData);
        
        // Log security event for patient creation
        await logSecurityEvent(userId, {
          eventType: SecurityEvents.PATIENT_CREATED,
          eventData: { patientName: sanitizedFormData.name }
        });
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
      
      // Log security event for failed operation
      await logSecurityEvent(userId, {
        eventType: editPatient ? SecurityEvents.PATIENT_UPDATED : SecurityEvents.PATIENT_CREATED,
        eventData: { 
          success: false, 
          error: error.message,
          patientName: formData.name 
        }
      });
      
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
