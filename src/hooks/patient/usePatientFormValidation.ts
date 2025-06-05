
import { useState } from 'react';
import { validateField } from '@/utils/patientValidation';
import { validateSecureForm } from '@/utils/securityValidation';

export const usePatientFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = (formData: any, birthDate?: Date | undefined, address?: any) => {
    console.log('Validating complete form:', { formData, birthDate, address });
    
    // Use the new secure validation
    const validation = validateSecureForm.patient({
      ...formData,
      address,
      birthDate
    });

    if (!validation.isValid) {
      console.log('Form validation failed:', validation.errors);
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

    console.log('Form validation passed');
    setErrors({});
    return true;
  };

  const validateAndSanitizeForm = (formData: any, birthDate?: Date | undefined, address?: any) => {
    console.log('Validating and sanitizing form:', { formData, birthDate, address });
    
    const validation = validateSecureForm.patient({
      ...formData,
      address,
      birthDate
    });

    const result = {
      isValid: validation.isValid && !!birthDate,
      errors: validation.isValid && !birthDate ? 
        { ...validation.errors, birthDate: 'Data de nascimento é obrigatória' } : 
        validation.errors,
      sanitizedData: validation.sanitizedData
    };

    console.log('Validation and sanitization result:', result);
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
