
import { useState } from 'react';
import { validateField } from '@/utils/patientValidation';
import { enhancedValidateSecureForm } from '@/utils/enhancedSecurityValidation';
import { useAuth } from '@/contexts/auth/AuthContext';

export const usePatientFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const handleValidateField = (field: string, value: any) => {
    console.log('Validating field in hook:', field, 'with value:', value);
    const error = validateField(field, value);
    console.log('Validation result:', error);
    
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
    return !error;
  };

  const validateForm = async (formData: any, birthDate?: Date | undefined, address?: any) => {
    console.log('Validating complete form with enhanced security:', { formData, birthDate, address });
    
    // Use the enhanced secure validation with server-side validation
    const validation = await enhancedValidateSecureForm.patient({
      ...formData,
      address,
      birthDate
    }, user?.id);

    if (!validation.isValid) {
      console.log('Enhanced form validation failed:', validation.errors);
      setErrors(validation.errors);
      return false;
    }

    // Additional birth date validation
    if (!birthDate) {
      const newErrors = { ...validation.errors, birthDate: 'Data de nascimento é obrigatória' };
      console.log('Birth date validation failed:', newErrors);
      setErrors(newErrors);
      return false;
    }

    console.log('Enhanced form validation passed');
    setErrors({});
    return true;
  };

  const validateAndSanitizeForm = async (formData: any, birthDate?: Date | undefined, address?: any) => {
    console.log('Validating and sanitizing form with enhanced security:', { formData, birthDate, address });
    
    const validation = await enhancedValidateSecureForm.patient({
      ...formData,
      address,
      birthDate
    }, user?.id);

    const result = {
      isValid: validation.isValid && !!birthDate,
      errors: validation.isValid && !birthDate ? 
        { ...validation.errors, birthDate: 'Data de nascimento é obrigatória' } : 
        validation.errors,
      sanitizedData: validation.sanitizedData
    };

    console.log('Enhanced validation and sanitization result:', result);
    
    if (!result.isValid) {
      setErrors(result.errors);
    }
    
    return result;
  };

  return {
    errors,
    setErrors,
    handleValidateField,
    validateForm,
    validateAndSanitizeForm
  };
};
