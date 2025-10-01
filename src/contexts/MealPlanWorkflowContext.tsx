/**
 * DEPRECATED - This context has been replaced by ClinicalWorkflowContext
 * This file exists only for backward compatibility during migration
 * All new code should use ClinicalWorkflowContext instead
 */

import { createContext, useContext, ReactNode, useState } from 'react';

// Legacy interface for backward compatibility
interface MealPlanWorkflowContextType {
  mealPlan: any;
  setMealPlan: (plan: any) => void;
}

const MealPlanWorkflowContext = createContext<MealPlanWorkflowContextType | undefined>(undefined);

export const MealPlanWorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [mealPlan, setMealPlan] = useState(null);
  
  const value = {
    mealPlan,
    setMealPlan,
  };

  return (
    <MealPlanWorkflowContext.Provider value={value}>
      {children}
    </MealPlanWorkflowContext.Provider>
  );
};

export const useMealPlanWorkflow = () => {
  const context = useContext(MealPlanWorkflowContext);
  if (!context) {
    throw new Error('useMealPlanWorkflow must be used within MealPlanWorkflowProvider');
  }
  return context;
};
