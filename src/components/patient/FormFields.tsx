
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BirthDateInput } from '@/components/BirthDateInput';

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
}

export const TextField = ({ id, name, label, value, onChange, required = false, type = 'text' }: TextFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}{required && '*'}</Label>
      <Input 
        id={id} 
        name={name} 
        type={type}
        value={value} 
        onChange={onChange}
        required={required} 
      />
    </div>
  );
};

interface DateFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string;
  label?: string;
}

export const DateField = ({ value, onChange, error, label = "Data de Nascimento*" }: DateFieldProps) => {
  return (
    <BirthDateInput 
      value={value} 
      onChange={onChange}
      error={error}
      label={label}
    />
  );
};

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  options: { value: string; label: string }[];
}

export const SelectField = ({ id, label, value, onChange, required = false, options }: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}{required && '*'}</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        required={required}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface RadioGroupFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  options: { value: string; label: string }[];
  className?: string;
}

export const RadioGroupField = ({ label, value, onChange, required = false, options, className = "flex gap-4" }: RadioGroupFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}{required && '*'}</Label>
      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        required={required}
        className={className}
      >
        {options.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`option-${option.value}`} />
            <Label htmlFor={`option-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
