
import { useState, useEffect } from 'react';
import { getCalculatorResults, saveCalculatorResults } from '../storageUtils';

/**
 * Hook to manage calculator results
 */
export const useCalculatorResults = () => {
  // Results states
  const [bmr, setBmr] = useState<number | null>(() => {
    const savedResults = getCalculatorResults();
    return savedResults?.bmr || null;
  });
  
  const [tee, setTee] = useState<number | null>(() => {
    const savedResults = getCalculatorResults();
    return savedResults?.tee || null;
  });
  
  const [macros, setMacros] = useState<{ carbs: number, protein: number, fat: number } | null>(() => {
    const savedResults = getCalculatorResults();
    return savedResults?.macros || null;
  });
  
  // Temp patient id state
  const [tempPatientId, setTempPatientId] = useState<string | null>(() => {
    const savedResults = getCalculatorResults();
    return savedResults?.tempPatientId || null;
  });
  
  // Save results to storage whenever they change
  useEffect(() => {
    if (bmr && tee && macros) {
      saveCalculatorResults(bmr, tee, macros, tempPatientId);
    }
  }, [bmr, tee, macros, tempPatientId]);

  return {
    bmr, 
    setBmr,
    tee, 
    setTee,
    macros, 
    setMacros,
    tempPatientId, 
    setTempPatientId
  };
};
