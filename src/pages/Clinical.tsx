
import React from 'react';
import { ClinicalProvider } from '@/contexts/ClinicalContext';
import ClinicalWorkflow from '@/components/clinical/ClinicalWorkflow';

const Clinical = () => {
  return (
    <div className="min-h-screen bg-background">
      <ClinicalProvider>
        <ClinicalWorkflow />
      </ClinicalProvider>
    </div>
  );
};

export default Clinical;
