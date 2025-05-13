
// Re-export all field components from the new structure
import { formatCpf, formatPhone, formatCep } from '@/utils/patientValidation';
export { TextField } from './fields/TextField';
export { DateField } from './fields/DateField';
export { TextAreaField } from './fields/TextAreaField';
export { SelectField } from './fields/SelectField';
export { RadioGroupField } from './fields/RadioGroupField';

// Re-export formatting utils that were previously in this file
export { formatCpf, formatPhone, formatCep };
