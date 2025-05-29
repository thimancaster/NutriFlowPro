
// Main export file for nutrition calculations - maintains backward compatibility
export * from './nutrition/tmbCalculations';
export * from './nutrition/getCalculations';
export * from './nutrition/vetCalculations';
export * from './nutrition/anthropometryCalculations';
export * from './nutrition/macroCalculations';
export * from './nutrition/validationUtils';
export * from './nutrition/completeCalculation';

// Legacy compatibility exports - redirect to new modular functions
export { calculateTMB as calculateBMR } from './nutrition/tmbCalculations';
export { calculateCompleteNutrition as calculateNutrition } from './nutrition/completeCalculation';
export { calculateMacrosByProfile as calculateMacros } from './nutrition/macroCalculations';
