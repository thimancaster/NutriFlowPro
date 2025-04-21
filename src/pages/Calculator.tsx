
import React from 'react';
import Navbar from '@/components/Navbar';
import CalculatorTool from '@/components/CalculatorTool';

const Calculator = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Calculadora Nutricional</h1>
        <CalculatorTool />
      </div>
    </div>
  );
};

export default Calculator;
