
import React from 'react';

/**
 * Header component for the subscription page
 */
const PageHeader: React.FC = () => (
  <>
    <h1 className="text-4xl font-bold text-center mb-4">
      <span className="text-nutri-green">Planos</span> 
      <span className="text-nutri-blue"> NutriFlow Pro</span>
    </h1>
    
    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
      Escolha o plano que melhor se adapta às suas necessidades e impulsione sua prática como nutricionista.
    </p>
  </>
);

export default PageHeader;
