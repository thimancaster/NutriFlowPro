
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import { validateSecureForm } from '@/utils/securityValidation';
import { csrfProtection, rateLimiter } from '@/utils/securityValidation';

interface UsePatientFormSubmitProps {
  editPatient?: Patient;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const usePatientFormSubmit = ({
  editPatient,
  onSuccess,
  onError,
}: UsePatientFormSubmitProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      // Validate form data
      const validation = validateSecureForm.patient(formData);
      
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join(', ');
        toast({
          title: "Dados inválidos",
          description: errorMessage,
          variant: "destructive"
        });
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Check rate limit
      const identifier = `patient_${user.id}`;
      const isAllowed = rateLimiter.isAllowed(identifier);
      
      if (!isAllowed) {
        const errorMessage = "Muitas tentativas. Aguarde um momento.";
        toast({
          title: "Limite excedido",
          description: errorMessage,
          variant: "destructive"
        });
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Add CSRF protection
      const protectedData = csrfProtection.attachToken(validation.sanitizedData);
      
      // Prepare patient data
      const patientData = {
        ...protectedData,
        user_id: user.id,
        birth_date: formData.birth_date,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        health_conditions: formData.health_conditions,
        medications: formData.medications,
        allergies: formData.allergies,
        notes: formData.notes,
        objective: formData.objective,
        activity_level: formData.activity_level,
        status: formData.status || 'active'
      };

      let result;
      
      if (editPatient) {
        // Update existing patient
        result = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', editPatient.id)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new patient
        result = await supabase
          .from('patients')
          .insert(patientData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Sucesso",
        description: editPatient ? "Paciente atualizado com sucesso!" : "Paciente criado com sucesso!",
      });
      
      onSuccess?.();
      
      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error saving patient:', error);
      
      const errorMessage = error.message || 'Erro ao salvar paciente';
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      onError?.(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
