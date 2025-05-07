
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2, UserPlus } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-nutri-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Taxa Metabólica Basal</CardTitle>
            <CardDescription>TMB</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-nutri-green-dark">{bmr} kcal</p>
            <p className="text-sm text-gray-600 mt-2">
              Energia necessária para funções vitais em repouso
            </p>
          </CardContent>
        </Card>

        <Card className="bg-nutri-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gasto Energético Total</CardTitle>
            <CardDescription>GET</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-nutri-blue">{Math.round(bmr * 1.55)} kcal</p>
            <p className="text-sm text-gray-600 mt-2">
              Calorias gastas incluindo atividade física
            </p>
          </CardContent>
        </Card>

        <Card className="bg-nutri-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Meta Calórica</CardTitle>
            <CardDescription>VET</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-nutri-blue-dark">{tee} kcal</p>
            <p className="text-sm text-gray-600 mt-2">
              Calorias totais ajustadas ao objetivo
            </p>
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
                  <p className="mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs inline-block">
                    {macros.proteinPerKg} g/kg
                  </p>
                )}
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Gorduras</p>
                <p className="text-2xl font-bold text-amber-600">{macros.fat}g</p>
                <p className="text-sm">{parseInt(fatPercentage)}% / {macros.fat * 9} kcal</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-base font-medium mb-2">Total Calórico</h3>
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
