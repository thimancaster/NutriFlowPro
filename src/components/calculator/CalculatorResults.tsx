
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import { CalculatorResultsProps } from './types';
import {
  MetricCard,
  CalorieAdjustmentBadge,
  MacroDistributionGrid,
  CalorieSummary,
  NutritionInfo,
  ActionButtons
} from './results';

const CalculatorResults = ({
  bmr,
  tee,
  macros,
  carbsPercentage,
  proteinPercentage,
  fatPercentage,
  handleSavePatient,
  handleGenerateMealPlan,
  isSavingPatient,
  hasPatientName,
  user
}: CalculatorResultsProps) => {
  if (bmr === null || tee === null) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Complete os dados e calcule para ver os resultados</p>
      </div>
    );
  }

  // Calculate unadjusted GET (base activity level * BMR)
  const baseGet = Math.round(bmr * 1.55); // Using moderate activity as reference
  
  // Calculate adjustment (difference between TEE and base GET)
  const calorieAdjustment = tee - baseGet;
  
  // Calculate reference protein ranges for display
  const proteinReferenceRange = {
    min: 0.8, // Minimum recommendation (g/kg)
    max: macros?.proteinPerKg && macros.proteinPerKg > 2 ? 2.5 : 2.0 // Higher range for athletic individuals
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Taxa Metabólica Basal"
          description="TMB"
          value={`${bmr} kcal`}
          infoText="Energia necessária para funções vitais em repouso, calculada pela fórmula de Mifflin-St Jeor"
          valueColor="text-nutri-green-dark"
          subtitle="Energia mínima para sustentar funções vitais em repouso"
        />

        <MetricCard
          title="Gasto Energético Total"
          description="GET"
          value={`${baseGet} kcal`}
          infoText="TMB × Fator de Atividade (sem ajustes)"
          valueColor="text-nutri-blue"
          subtitle="Calorias gastas incluindo atividade física"
        />

        <Card className="bg-nutri-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Meta Calórica
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 ml-1 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">GET {calorieAdjustment >= 0 ? "+" : ""}{calorieAdjustment} kcal de ajuste conforme objetivo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>VET (Valor Energético Total)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-nutri-blue-dark">{tee} kcal</p>
            <CalorieAdjustmentBadge calorieAdjustment={calorieAdjustment} />
          </CardContent>
        </Card>
      </div>

      {macros && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribuição de Macronutrientes</CardTitle>
            <CardDescription>
              {carbsPercentage}% Carboidratos, {proteinPercentage}% Proteínas, {fatPercentage}% Gorduras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MacroDistributionGrid
              macros={macros}
              carbsPercentage={carbsPercentage}
              proteinPercentage={proteinPercentage}
              fatPercentage={fatPercentage}
              proteinReferenceRange={proteinReferenceRange}
            />

            <CalorieSummary 
              macros={macros} 
              tee={tee} 
            />

            <NutritionInfo macros={macros} />
          </CardContent>
        </Card>
      )}

      <ActionButtons
        handleSavePatient={handleSavePatient}
        handleGenerateMealPlan={handleGenerateMealPlan}
        isSavingPatient={isSavingPatient}
        hasPatientName={hasPatientName}
        user={user}
      />
    </div>
  );
};

export default CalculatorResults;
