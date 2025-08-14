
import React from 'react';
import { Helmet } from 'react-helmet';
import PlanilhaCalculatorForm from '@/components/calculator/PlanilhaCalculatorForm';

const PlanilhaCalculator: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Calculadora da Planilha Nutricional - NutriFlow Pro</title>
        <meta name="description" content="Calculadora baseada na planilha original com fórmulas exatas de TMB, GET e VET" />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Calculadora da Planilha Nutricional
        </h1>
        <p className="text-gray-600">
          Sistema de cálculos que replica fielmente a lógica da planilha original, 
          com fórmulas exatas de TMB, GET e VET conforme especificado.
        </p>
      </div>

      <PlanilhaCalculatorForm />
    </div>
  );
};

export default PlanillaCalculator;
