/**
 * DEPRECATED - This context has been replaced by ClinicalWorkflowContext
 * This file exists only for backward compatibility during migration
 * All new code should use ClinicalWorkflowContext instead
 */

import { createContext, useContext, ReactNode, useState } from 'react';

// Legacy interface for backward compatibility
interface NutritionWorkflowContextType {
  calculationData: any;
  setCalculationData: (data: any) => void;
}

const NutritionWorkflowContext = createContext<NutritionWorkflowContextType | undefined>(undefined);

export const NutritionWorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [calculationData, setCalculationData] = useState(null);
  
  const value = {
    calculationData,
    setCalculationData,
  };

  return (
    <NutritionWorkflowContext.Provider value={value}>
      {children}
    </NutritionWorkflowContext.Provider>
  );
};

export const useNutritionWorkflow = () => {
  const context = useContext(NutritionWorkflowContext);
  if (!context) {
    throw new Error('useNutritionWorkflow must be used within NutritionWorkflowProvider');
  }
  return context;
};
