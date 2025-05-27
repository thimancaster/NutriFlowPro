
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from 'lucide-react';
import { CalculatorResultsProps } from './types';
import {
  MetricCard,
  CalorieAdjustmentBadge,
  MacroDistributionGrid,
  NutritionInfo,
  ActionButtons
} from './results';

const CalculatorResults: React.FC<CalculatorResultsProps> = ({
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
}) => {
  if (!bmr || !tee || !macros) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-500">Complete os dados e calcule para ver os resultados</p>
        </CardContent>
      </Card>
    );
  }

  // Create a simple calorie summary
  const summary = {
    targetCalories: tee.vet,
    actualCalories: (macros.protein.kcal || 0) + (macros.fat.kcal || 0) + (macros.carbs.kcal || 0),
    difference: 0,
    percentageDifference: 0
  };

  // Check if user is premium (simplified mock check)
  const isUserPremium = user?.is_premium || false;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <span>Resultados do Cálculo</span>
          <Info className="h-5 w-5 ml-2 text-nutri-blue opacity-70" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 gap-4">
          <MetricCard
            title="Taxa Metabólica Basal"
            description="TMB"
            value={`${bmr} kcal`}
            infoText="Energia necessária para funções vitais em repouso, calculada pela fórmula de Mifflin-St Jeor"
            valueColor="text-nutri-green"
            subtitle="(10 × peso) + (6.25 × altura) - (5 × idade) + fator sexo"
          />
          
          <MetricCard
            title="Gasto Energético Total"
            description="GET"
            value={`${tee.get} kcal`}
            infoText="TMB × Fator de Atividade"
            valueColor="text-nutri-blue"
            subtitle="Calorias necessárias para manutenção do peso"
          />
          
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">Meta Calórica</h3>
              <CalorieAdjustmentBadge 
                adjustment={tee.adjustment} 
                objective={carbsPercentage ? 'custom' : ''} 
              />
            </div>
            <div className="text-2xl font-bold text-nutri-blue">{tee.vet} kcal</div>
            <div className="text-sm text-gray-600 mt-1">VET (Valor Energético Total)</div>
          </div>
        </div>
        
        {/* Macronutrient Distribution */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Distribuição de Macronutrientes</h3>
          
          {/* User has manually set percentages */}
          {carbsPercentage && proteinPercentage && fatPercentage && (
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-amber-50 p-2 rounded">
                <div className="text-xs text-gray-500">Proteínas</div>
                <div className="font-semibold">{proteinPercentage}%</div>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xs text-gray-500">Carboidratos</div>
                <div className="font-semibold">{carbsPercentage}%</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="text-xs text-gray-500">Gorduras</div>
                <div className="font-semibold">{fatPercentage}%</div>
              </div>
            </div>
          )}
          
          {/* Macro details */}
          <MacroDistributionGrid 
            macros={macros} 
            proteinPerKg={macros.proteinPerKg}
            weight={macros.protein.grams / (macros.proteinPerKg || 1)} // Calculate weight for per/kg display
          />
        </div>
        
        {/* Nutrition Info Block */}
        <NutritionInfo
          objective={carbsPercentage ? 'custom' : 'manutenção'}
          activityLevel={'moderado'}
          profile={'magro'}
        />
        
        {/* Action Buttons */}
        <ActionButtons
          onSavePatient={handleSavePatient}
          onGenerateMealPlan={handleGenerateMealPlan}
          isSaving={isSavingPatient}
          hasResults={!!tee && !!macros}
          hasPatientName={hasPatientName}
          userIsPremium={isUserPremium}
        />
      </CardContent>
    </Card>
  );
};

export default CalculatorResults;
