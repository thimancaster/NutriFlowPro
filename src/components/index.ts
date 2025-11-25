
// Export all components for easy imports
export { default as ConsultationHeader } from './ConsultationHeader';
export { default as MealPlanActions } from './meal-plan/MealPlanActions';
export { BirthDatePicker } from './ui/birth-date-picker';
export { default as ConsultationForm } from './Consultation/ConsultationForm';
export { default as ConsultationResults } from './Consultation/ConsultationResults';

// Calculator components exports - Updated to use the modular calculator
export { 
  CalculatorTool, 
  CalculatorInputs, 
  MacroDistributionInputs, 
  CalculatorResults,
  CalculatorActions
} from './calculator';
