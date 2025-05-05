
// Export all calculator components for easy imports
export { default as CalculatorTool } from "./CalculatorTool";
export { default as CalculatorInputs } from "./CalculatorInputs";
export { default as MacroDistributionInputs } from "./MacroDistributionInputs";
export { default as CalculatorResults } from "./CalculatorResults";
export { default } from "./CalculatorTool"; // Default export still points to CalculatorTool

// Export the hook as well
export { default as useCalculatorState } from "./useCalculatorState";
