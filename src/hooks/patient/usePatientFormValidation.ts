
import { useState } from 'react';
import { validateField } from '@/utils/patientValidation';

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
    let isValid = true;
    const newErrors = {} as Record<string, string>;
    
    // Validate basic info
    const fields = ['name', 'sex', 'email', 'phone', 'secondaryPhone', 'cpf', 'objective', 'profile'];
    fields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    // Validate birth date
    if (!birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
      isValid = false;
    }
    
    // Address validation can be partial
    if (address?.cep) {
      const error = validateField('address.cep', address.cep);
      if (error) {
        newErrors['address.cep'] = error;
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  return {
    errors,
    setErrors,
    handleValidateField,
    validateForm
  };
};
