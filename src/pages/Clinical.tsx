
import React from 'react';
import { UnifiedEcosystemProvider } from '@/contexts/UnifiedEcosystemContext';
import ClinicalWorkflow from '@/components/clinical/ClinicalWorkflow';

const Clinical = () => {
  return (
    <UnifiedEcosystemProvider>
      <div className="min-h-screen bg-background">
        <ClinicalWorkflow />
      </div>
    </UnifiedEcosystemProvider>
  );
};

export default Clinical;
