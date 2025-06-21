
/**
 * Results management for calculator
 */

import { useState } from 'react';

export interface CalculationResults {
  tmbValue: number;
  teeObject: {
    tmb: number;
    get: number;
    vet: number;
    adjustment: number;
  };
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
    proteinPerKg: number;
  };
  calorieSummary: any;
  formulaUsed: string;
}

export const useCalculatorResults = () => {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const resetResults = () => {
    setResults(null);
    setShowResults(false);
  };

  return {
    results,
    isCalculating,
    showResults,
    setIsCalculating,
    setResults,
    setShowResults,
    resetResults,
    // Individual result accessors for compatibility
    tmbValue: results?.tmbValue || null,
    teeObject: results?.teeObject || null,
    macros: results?.macros || null,
    calorieSummary: results?.calorieSummary || null,
    formulaUsed: results?.formulaUsed
  };
};
