
// Export all hooks with proper named exports
export { useCalculatorForm } from './useCalculatorForm';
export { useCalculatorResults } from './useCalculatorResults';
export { useCalculationLogic } from './useCalculationLogic';
export { usePatientActions } from './usePatientActions';

// Also export default versions for backward compatibility
import useCalculatorForm from './useCalculatorForm';
import useCalculatorResults from './useCalculatorResults';
import useCalculationLogic from './useCalculationLogic';
import usePatientActions from './usePatientActions';

export {
  useCalculatorForm as default,
  useCalculatorResults,
  useCalculationLogic,
  usePatientActions
};
