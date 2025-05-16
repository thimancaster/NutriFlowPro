
import React from 'react';
import { Label } from '@/components/ui/label';
import { BirthDateInput } from '@/components/BirthDateInput';
import { DateFieldProps } from '../field-types';

export const DateField = ({ 
  value, 
  onChange, 
  error, 
  label = "Data de Nascimento", 
  required = false, 
  onBlur 
}: DateFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}{required && '*'}</Label>
      <BirthDateInput 
        value={value} 
        onChange={onChange}
        error={error}
        onBlur={onBlur}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Add default export
export default DateField;
