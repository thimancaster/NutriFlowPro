
import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep >= 1 ? 'bg-white text-nutri-blue' : 'bg-white/30 text-white'
        }`}>
          {currentStep > 1 ? <Check className="h-5 w-5" /> : 1}
        </div>
        <div className={`h-1 w-8 ${currentStep > 1 ? 'bg-white' : 'bg-white/30'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep >= 2 ? 'bg-white text-nutri-blue' : 'bg-white/30 text-white'
        }`}>
          2
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
