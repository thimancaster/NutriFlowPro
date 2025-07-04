
import React from 'react';
import { ConsultationDataProvider } from '@/contexts/ConsultationDataContext';
import ClinicalWorkflow from '@/components/clinical/ClinicalWorkflow';

const Clinical = () => {
  return (
    <div className="min-h-screen bg-background">
      <ConsultationDataProvider>
        <ClinicalWorkflow />
      </ConsultationDataProvider>
    </div>
  );
};

export default Clinical;
