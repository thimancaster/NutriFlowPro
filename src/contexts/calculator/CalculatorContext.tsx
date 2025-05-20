
import React, { createContext, useContext } from 'react';
import { CalculatorContextType } from './types';
import { useCalculatorState } from './useCalculatorState';

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const calculatorState = useCalculatorState();
  
  return (
    <CalculatorContext.Provider value={calculatorState}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
