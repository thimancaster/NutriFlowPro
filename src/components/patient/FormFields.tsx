
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BirthDateInput } from '@/components/BirthDateInput';
import { Textarea } from '@/components/ui/textarea';
import { formatCpf, formatPhone, formatCep } from '@/utils/patientValidation';

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  error?: string;
  onBlur?: () => void;
  placeholder?: string;
  mask?: (value: string) => string;
}

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

interface DateFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string;
  label?: string;
  onBlur?: () => void;
  required?: boolean;
}

export const DateField = ({ value, onChange, error, label = "Data de Nascimento", required = false, onBlur }: DateFieldProps) => {
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

interface TextAreaFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
}

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

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  options: { value: string; label: string }[];
  error?: string;
  onBlur?: () => void;
}

export const SelectField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  required = false, 
  options,
  error,
  onBlur
}: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}{required && '*'}</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        required={required}
        onOpenChange={(open) => {
          if (!open && onBlur) onBlur();
        }}
      >
        <SelectTrigger id={id} className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
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
  error?: string;
  onBlur?: () => void;
}

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
