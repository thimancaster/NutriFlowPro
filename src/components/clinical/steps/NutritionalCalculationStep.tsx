/**
 * Nutritional Calculation Step for Clinical Workflow
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClinicalWorkflow } from '@/contexts/ClinicalWorkflowContext';
import { useOfficialCalculations } from '@/hooks/useOfficialCalculations';

export const NutritionalCalculationStep: React.FC = () => {
  const { nextStep, activePatient } = useClinicalWorkflow();
  const { calculate, results, loading } = useOfficialCalculations();
  
  const handleCalculate = async () => {
    await calculate();
    nextStep();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cálculo Nutricional</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Paciente: {activePatient?.name}</p>
        <Button onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculando...' : 'Calcular e Avançar'}
        </Button>
        {results && (
          <div className="mt-4">
            <p>TMB: {results.tmb.value} kcal</p>
            <p>VET: {results.vet} kcal</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionalCalculationStep;
