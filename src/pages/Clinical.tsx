
import React from 'react';
import Navbar from '@/components/Navbar';
import { ClinicalProvider } from '@/contexts/ClinicalContext';
import ClinicalWorkflow from '@/components/clinical/ClinicalWorkflow';

const Clinical = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ClinicalProvider>
        <ClinicalWorkflow />
      </ClinicalProvider>
    </div>
  );
};

export default Clinical;
