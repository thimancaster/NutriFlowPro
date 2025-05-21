
import React from 'react';
import { BirthDatePicker } from '@/components/ui/birth-date-picker';

interface BirthDateInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string;
  label?: string;
  onBlur?: () => void;
}

export function BirthDateInput({
  value,
  onChange,
  error,
  label = "Data de Nascimento*",
  onBlur
}: BirthDateInputProps) {
  return (
    <div className="space-y-2">
      <BirthDatePicker
        value={value}
        onChange={onChange}
        error={error}
        onBlur={onBlur}
        label={label}
      />
    </div>
  );
}
