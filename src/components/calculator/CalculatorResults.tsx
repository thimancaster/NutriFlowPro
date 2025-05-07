
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2, UserPlus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalculatorResultsProps } from './types';

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
        <Card className="bg-nutri-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Taxa Metabólica Basal
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 ml-1 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Energia necessária para funções vitais em repouso, calculada pela fórmula de Mifflin-St Jeor</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>TMB</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-nutri-green-dark">{bmr} kcal</p>
            <p className="text-sm text-gray-600 mt-2">
              Energia mínima para sustentar funções vitais em repouso
            </p>
          </CardContent>
        </Card>

        <Card className="bg-nutri-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Gasto Energético Total
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 ml-1 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">TMB × Fator de Atividade (sem ajustes)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>GET</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-nutri-blue">{baseGet} kcal</p>
            <p className="text-sm text-gray-600 mt-2">
              Calorias gastas incluindo atividade física
            </p>
          </CardContent>
        </Card>

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
            <div className="mt-2 text-sm flex items-center">
              <span className={`px-2 py-1 rounded-full ${calorieAdjustment > 0 ? 'bg-green-100 text-green-800' : calorieAdjustment < 0 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                {calorieAdjustment > 0 
                  ? `+${calorieAdjustment} kcal (superávit)` 
                  : calorieAdjustment < 0 
                  ? `${calorieAdjustment} kcal (déficit)` 
                  : 'Manutenção'}
              </span>
            </div>
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
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Carboidratos</p>
                <p className="text-2xl font-bold text-nutri-green">{macros.carbs}g</p>
                <p className="text-sm">{parseInt(carbsPercentage)}% / {macros.carbs * 4} kcal</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Proteínas</p>
                <p className="text-2xl font-bold text-nutri-blue">{macros.protein}g</p>
                <p className="text-sm">{parseInt(proteinPercentage)}% / {macros.protein * 4} kcal</p>
                {macros.proteinPerKg && (
                  <div>
                    <p className="mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs inline-block">
                      {macros.proteinPerKg.toFixed(1)} g/kg
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="ml-1">
                          <Info className="h-3 w-3 inline text-blue-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Referência: {proteinReferenceRange.min} - {proteinReferenceRange.max} g/kg</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Gorduras</p>
                <p className="text-2xl font-bold text-amber-600">{macros.fat}g</p>
                <p className="text-sm">{parseInt(fatPercentage)}% / {macros.fat * 9} kcal</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-base font-medium mb-2">Resumo Calórico</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Calorias do plano:</p>
                  <p className="text-lg font-semibold">{(macros.carbs * 4) + (macros.protein * 4) + (macros.fat * 9)} kcal</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Meta calórica:</p>
                  <p className="text-lg font-semibold">{tee} kcal</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Diferença:</p>
                  <p className={`text-lg font-semibold ${Math.abs((macros.carbs * 4) + (macros.protein * 4) + (macros.fat * 9) - tee) <= 10 ? 'text-green-600' : 'text-amber-600'}`}>
                    {Math.round((macros.carbs * 4) + (macros.protein * 4) + (macros.fat * 9)) - tee} kcal
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800">Informações Adicionais</h4>
              <ul className="mt-1 text-xs text-blue-800 space-y-1">
                <li>• Carboidratos e proteínas fornecem 4 kcal/g</li>
                <li>• Gorduras fornecem 9 kcal/g</li>
                {macros.proteinPerKg && (
                  <li>• Recomendação de proteína: {macros.proteinPerKg.toFixed(1)} g/kg de peso corporal</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {user && hasPatientName && (
          <Button 
            onClick={handleSavePatient}
            variant="outline"
            className="border-nutri-blue text-nutri-blue flex items-center gap-2"
            disabled={isSavingPatient}
          >
            {isSavingPatient ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-1" />
            )}
            Salvar Paciente
          </Button>
        )}
        
        <Button 
          onClick={handleGenerateMealPlan} 
          className="bg-nutri-green hover:bg-nutri-green-dark flex items-center gap-2"
          size="default"
        >
          Gerar Plano Alimentar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CalculatorResults;
