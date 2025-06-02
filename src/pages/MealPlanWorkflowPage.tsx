
import React from 'react';
import { MealPlanWorkflowProvider } from '@/contexts/MealPlanWorkflowContext';
import MealPlanWorkflow from '@/components/MealPlanWorkflow/MealPlanWorkflow';

const MealPlanWorkflowPage: React.FC = () => {
  return (
    <MealPlanWorkflowProvider>
      <MealPlanWorkflow />
    </MealPlanWorkflowProvider>
  );
};

export default MealPlanWorkflowPage;
