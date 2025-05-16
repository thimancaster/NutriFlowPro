
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  mask?: (value: string) => string;
  onBlur?: () => void;
  isLoading?: boolean;
}

export const TextField = ({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  mask,
  onBlur,
  isLoading = false
}: TextFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    
    if (mask) {
      // Create a new event with the masked value
      const maskedEvent = {
        ...e,
        target: {
          ...e.target,
          value: mask(inputValue)
        }
      };
      onChange(maskedEvent as React.ChangeEvent<HTMLInputElement>);
    } else {
      onChange(e);
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center">
        <Label
          htmlFor={id}
          className={`text-sm font-medium ${
            error ? 'text-red-500' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        )}
      </div>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`mt-1 w-full ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        }`}
        onBlur={onBlur}
        disabled={isLoading}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default TextField;
