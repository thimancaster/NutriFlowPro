
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
  onGenerateMealPlan: () => void;
  onExportResults: () => void;
  isGeneratingMealPlan?: boolean;
}

export const ENPResultsPanel: React.FC<ENPResultsPanelProps> = ({
  results,
  weight,
  onGenerateMealPlan,
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
        onGenerateMealPlan={onGenerateMealPlan}
        onExportResults={onExportResults}
        isGenerating={isGeneratingMealPlan}
      />
    </div>
  );
};
