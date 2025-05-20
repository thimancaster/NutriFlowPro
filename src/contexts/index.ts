
// Export all context providers for easier imports
export { AuthProvider } from './auth/AuthContext';
export { CalculatorProvider } from './calculator/CalculatorContext';
export { PatientProvider } from './patient/PatientContext';
export { default as PatientContext } from './PatientContext';

// Export all hooks for accessing contexts
export { useAuth } from './auth/AuthContext';
export { useCalculator } from './calculator/CalculatorContext';
export { usePatient } from './patient/PatientContext';
