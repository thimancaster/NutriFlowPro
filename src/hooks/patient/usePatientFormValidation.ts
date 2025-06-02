
import { useState } from 'react';
import { validateField } from '@/utils/patientValidation';
import { validateSecureForm } from '@/utils/securityValidation';

export const usePatientFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleValidateField = (field: string, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
    return !error;
  };

  const validateForm = (formData: any, birthDate?: Date | undefined, address?: any) => {
    // Use the new secure validation
    const validation = validateSecureForm.patient({
      ...formData,
      address,
      birthDate
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    // Additional birth date validation
    if (!birthDate) {
      const newErrors = { ...validation.errors, birthDate: 'Data de nascimento é obrigatória' };
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const validateAndSanitizeForm = (formData: any, birthDate?: Date | undefined, address?: any) => {
    const validation = validateSecureForm.patient({
      ...formData,
      address,
      birthDate
    });

    return {
      isValid: validation.isValid && !!birthDate,
      errors: validation.isValid && !birthDate ? 
        { ...validation.errors, birthDate: 'Data de nascimento é obrigatória' } : 
        validation.errors,
      sanitizedData: validation.sanitizedData
    };
  };

  return {
    errors,
    setErrors,
    handleValidateField,
    validateForm,
    validateAndSanitizeForm
  };
};
