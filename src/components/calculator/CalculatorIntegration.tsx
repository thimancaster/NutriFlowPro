import React from 'react';
import { OfficialCalculatorForm } from './official/OfficialCalculatorForm';
import { useToast } from '@/hooks/use-toast';

interface CalculatorIntegrationProps {
  onCalculationComplete?: (results: any) => void;
}

/**
 * Main Calculator Integration Component
 * Uses the official calculation system with all three formulas:
 * - Harris-Benedict (Eutrophic patients)
 * - Mifflin-St Jeor (Overweight/Obesity)
 * - Tinsley (Athletes)
 */
export const CalculatorIntegration: React.FC<CalculatorIntegrationProps> = ({
  onCalculationComplete
}) => {
  const { toast } = useToast();

  const handleCalculationResults = (results: any) => {
    console.log('[CALCULATOR_INTEGRATION] ✅ Calculation completed:', {
      formula: results.tmb.formula,
      tmb: results.tmb.value,
      vet: results.vet,
      macros: {
        protein: results.macros.protein.grams,
        carbs: results.macros.carbs.grams,
        fats: results.macros.fat.grams
      }
    });

    toast({
      title: "Cálculo Concluído",
      description: `Fórmula ${results.tmb.formula} | VET: ${results.vet} kcal`,
    });

    onCalculationComplete?.(results);
  };

  return (
    <OfficialCalculatorForm onResultsCalculated={handleCalculationResults} />
  );
};

export default CalculatorIntegration;