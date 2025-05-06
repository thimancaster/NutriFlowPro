
import React, { useState, useEffect } from 'react';
import { BirthDatePicker } from '@/components/ui/birth-date-picker';
import { Label } from '@/components/ui/label';

interface BirthDateInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string;
  label?: string;
  onBlur?: () => void; // Added missing onBlur property
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
      <Label htmlFor="birthdate">{label}</Label>
      <BirthDatePicker
        value={value}
        onChange={onChange}
        error={error}
        onBlur={onBlur}
      />
    </div>
  );
}
