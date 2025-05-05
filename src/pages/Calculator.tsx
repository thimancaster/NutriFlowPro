
import React from 'react';
import { CalculatorTool } from '@/components/calculator';

const CalculatorPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-6">Calculadora Nutricional</h1>
      <CalculatorTool />
    </div>
  );
};

export default CalculatorPage;
