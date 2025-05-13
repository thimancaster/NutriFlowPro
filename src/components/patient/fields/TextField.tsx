
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextFieldProps } from '../field-types';

export const TextField = ({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  required = false, 
  type = 'text', 
  error,
  onBlur,
  placeholder,
  mask
}: TextFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mask) {
      e.target.value = mask(e.target.value);
    }
    onChange(e);
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}{required && '*'}</Label>
      <Input 
        id={id} 
        name={name} 
        type={type}
        value={value} 
        onChange={handleChange}
        required={required}
        onBlur={onBlur}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
