
import React from 'react';
import { UnifiedEcosystemProvider } from '@/contexts/UnifiedEcosystemContext';
import MealPlanGenerator from '@/components/meal-plan/MealPlanGenerator';

const MealPlanGeneratorPage: React.FC = () => {
  return (
    <UnifiedEcosystemProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <MealPlanGenerator />
        </div>
      </div>
    </UnifiedEcosystemProvider>
  );
};

export default MealPlanGeneratorPage;
