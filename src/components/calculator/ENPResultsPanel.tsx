
import React from 'react';
import { MealDistributionENP } from './meal-distribution/MealDistributionENP';
import { NutritionalValidationENP } from './meal-distribution/NutritionalValidationENP';
import { MealPlanIntegrationENP } from './meal-distribution/MealPlanIntegrationENP';

interface ENPResultsPanelProps {
  results: {
    tmb: number;
    get: number;
    vet: number;
    adjustment: number;
    macros: {
      protein: { grams: number; kcal: number };
      carbs: { grams: number; kcal: number };
      fat: { grams: number; kcal: number };
    };
  };
  weight: number;
  onExportResults: () => void;
  isGeneratingMealPlan?: boolean;
}

export const ENPResultsPanel: React.FC<ENPResultsPanelProps> = ({
  results,
  weight,
  onExportResults,
  isGeneratingMealPlan = false
}) => {
  return (
    <div className="space-y-6">
      {/* Validação Nutricional */}
      <NutritionalValidationENP
        vet={results.vet}
        macros={results.macros}
        weight={weight}
      />
      
      {/* Distribuição de Refeições */}
      <MealDistributionENP
        vet={results.vet}
        macros={results.macros}
      />
      
      {/* Integração com Plano Alimentar */}
      <MealPlanIntegrationENP
        vet={results.vet}
        macros={results.macros}
        weight={weight}
        calculationData={results}
        onExportResults={onExportResults}
        isGenerating={isGeneratingMealPlan}
      />
    </div>
  );
};
