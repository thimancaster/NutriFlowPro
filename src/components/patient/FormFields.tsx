
// Re-export all field components from the new structure
import { formatCpf, formatPhone, formatCep } from '@/utils/patientValidation';
import { TextField, DateField, TextAreaField, SelectField, RadioGroupField } from './fields';

export { TextField, DateField, TextAreaField, SelectField, RadioGroupField };

// Re-export formatting utils that were previously in this file
export { formatCpf, formatPhone, formatCep };
