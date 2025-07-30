
import React from 'react';
import { MealPlanWorkflowProvider } from '@/contexts/MealPlanWorkflowContext';
import UnifiedConsultationFlow from '@/components/unified/UnifiedConsultationFlow';

const UnifiedConsultationPage: React.FC = () => {
  return (
    <MealPlanWorkflowProvider>
      <div className="container mx-auto p-6">
        <UnifiedConsultationFlow />
      </div>
    </MealPlanWorkflowProvider>
  );
};

export default UnifiedConsultationPage;
