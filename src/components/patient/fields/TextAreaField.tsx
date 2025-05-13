
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TextAreaFieldProps } from '../field-types';

export const TextAreaField = ({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  required = false, 
  error,
  onBlur,
  placeholder,
  rows = 3
}: TextAreaFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}{required && '*'}</Label>
      <Textarea 
        id={id} 
        name={name}
        value={value} 
        onChange={onChange}
        required={required}
        onBlur={onBlur}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        rows={rows}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
