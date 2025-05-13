
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RadioGroupFieldProps } from '../field-types';

export const RadioGroupField = ({ 
  label, 
  value, 
  onChange, 
  required = false, 
  options, 
  className = "flex gap-4",
  error,
  onBlur
}: RadioGroupFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}{required && '*'}</Label>
      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        required={required}
        className={className}
        onFocus={() => {}}
        onBlur={onBlur}
      >
        {options.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option.value} 
              id={`option-${option.value}`}
              className={error ? "border-red-500" : ""}
            />
            <Label htmlFor={`option-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
