
// Export all field components
export { TextField } from './TextField';
export { DateField } from './DateField';
export { TextAreaField } from './TextAreaField';
export { SelectField } from './SelectField';
export { RadioGroupField } from './RadioGroupField';

// Import the named exports and re-export as default object
import { TextField } from './TextField';
import { DateField } from './DateField';
import { TextAreaField } from './TextAreaField';
import { SelectField } from './SelectField';
import { RadioGroupField } from './RadioGroupField';

export default {
  TextField,
  DateField,
  TextAreaField,
  SelectField,
  RadioGroupField
};
