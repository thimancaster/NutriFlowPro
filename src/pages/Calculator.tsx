
import React from 'react';
import { UnifiedEcosystemProvider } from '@/contexts/UnifiedEcosystemContext';
import { CalculatorProvider } from '@/contexts/calculator/CalculatorContext';
import CalculatorLayout from '@/components/calculator/CalculatorLayout';

const Calculator: React.FC = () => {
  return (
    <UnifiedEcosystemProvider>
      <CalculatorProvider>
        <div className="min-h-screen bg-background">
          <CalculatorLayout />
        </div>
      </CalculatorProvider>
    </UnifiedEcosystemProvider>
  );
};

export default Calculator;
