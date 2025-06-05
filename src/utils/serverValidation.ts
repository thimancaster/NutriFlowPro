
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Server-side patient data validation using the database function
 */
export const validatePatientDataServer = async (
  name: string,
  email?: string,
  phone?: string,
  cpf?: string
): Promise<ValidationResult> => {
  try {
    const { data, error } = await supabase.rpc('validate_patient_data', {
      p_name: name,
      p_email: email || null,
      p_phone: phone || null,
      p_cpf: cpf || null
    });

    if (error) {
      console.error('Server validation error:', error);
      return {
        isValid: false,
        errors: { general: 'Erro de validação no servidor' }
      };
    }

    return {
      isValid: data.isValid,
      errors: data.errors || {}
    };
  } catch (error) {
    console.error('Validation failed:', error);
    return {
      isValid: false,
      errors: { general: 'Erro de validação no servidor' }
    };
  }
};
