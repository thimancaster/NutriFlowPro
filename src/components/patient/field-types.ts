
import React from 'react';

// Common properties shared by all field types
export interface BaseFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  onBlur?: () => void;
}

// Text field specific props
export interface TextFieldProps extends BaseFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  mask?: (value: string) => string;
}

// Date field specific props
export interface DateFieldProps extends BaseFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

// Text area specific props
export interface TextAreaFieldProps extends BaseFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}

// Select field specific props
export interface SelectFieldProps extends BaseFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

// Radio group specific props
export interface RadioGroupFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}
