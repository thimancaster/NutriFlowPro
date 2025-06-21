
import React, { createContext, useContext, ReactNode } from 'react';
import { useENPCalculatorLogic } from '@/components/calculator/enp/ENPCalculatorLogic';

// A tipagem do contexto é inferida diretamente do hook que contém a lógica.
type ENPCalculatorContextType = ReturnType<typeof useENPCalculatorLogic>;

const ENPCalculatorContext = createContext<ENPCalculatorContextType | undefined>(undefined);

interface ENPCalculatorProviderProps {
  children: ReactNode;
  // Permite que um componente pai sobrescreva a função de exportação.
  onExportResults?: () => void;
}

export const ENPCalculatorProvider: React.FC<ENPCalculatorProviderProps> = ({ children, onExportResults }) => {
  const calculatorLogic = useENPCalculatorLogic();
  
  const value = {
    ...calculatorLogic,
    // Se `onExportResults` for fornecido, ele tem prioridade sobre a lógica padrão.
    handleExportResults: onExportResults || calculatorLogic.handleExportResults,
  };

  return (
    <ENPCalculatorContext.Provider value={value}>
      {children}
    </ENPCalculatorContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto nos componentes.
export const useENPCalculator = () => {
  const context = useContext(ENPCalculatorContext);
  if (context === undefined) {
    throw new Error('useENPCalculator must be used within a ENPCalculatorProvider');
  }
  return context;
};
