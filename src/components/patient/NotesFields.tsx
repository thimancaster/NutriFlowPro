import React from 'react';
import { TextAreaField } from './fields';

interface NotesFieldsProps {
  notes: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  errors: Record<string, string>;
  validateField: (field: string, value: any) => void;
}

const NotesFields = ({ notes, onChange, errors, validateField }: NotesFieldsProps) => {
  return (
    <TextAreaField
      id="notes"
      name="notes"
      label="Observações"
      value={notes || ''}
      onChange={onChange}
      rows={4}
      placeholder="Observações importantes sobre o paciente..."
      error={errors.notes}
      onBlur={() => validateField('notes', notes)}
    />
  );
};

export default NotesFields;
