
import React from 'react';
import { MealPlanWorkflowProvider } from '@/contexts/MealPlanWorkflowContext';
import MealPlanWorkflow from '@/components/MealPlanWorkflow/MealPlanWorkflow';

const MealPlanWorkflowPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <MealPlanWorkflowProvider>
        <MealPlanWorkflow />
      </MealPlanWorkflowProvider>
    </div>
  );
};

export default MealPlanWorkflowPage;
