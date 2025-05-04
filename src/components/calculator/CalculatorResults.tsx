
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2, UserPlus } from 'lucide-react';

interface CalculatorResultsProps {
  bmr: number | null;
  tee: number | null;
  macros: { carbs: number; protein: number; fat: number } | null;
  carbsPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
  handleSavePatient: () => void;
  handleGenerateMealPlan: () => void;
  isSavingPatient: boolean;
  hasPatientName: boolean;
  user: any;
}

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-nutri-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Taxa Metabólica Basal (TMB)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-nutri-green-dark">{bmr} kcal/dia</p>
            <p className="text-sm text-gray-600 mt-2">
              Energia necessária para manter as funções vitais em repouso.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-nutri-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gasto Energético Total (GET)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-nutri-blue-dark">{tee} kcal/dia</p>
            <p className="text-sm text-gray-600 mt-2">
              Energia total necessária, considerando seu nível de atividade.
            </p>
          </CardContent>
        </Card>
      </div>

      {macros && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribuição de Macronutrientes</CardTitle>
            <CardDescription>
              Baseado em: {carbsPercentage}% Carboidratos, {proteinPercentage}% Proteínas, {fatPercentage}% Gorduras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Carboidratos</p>
                <p className="text-xl font-bold text-nutri-green">{macros.carbs}g</p>
                <p className="text-sm">{parseInt(carbsPercentage)}% / {macros.carbs * 4} kcal</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Proteínas</p>
                <p className="text-xl font-bold text-nutri-blue">{macros.protein}g</p>
                <p className="text-sm">{parseInt(proteinPercentage)}% / {macros.protein * 4} kcal</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gorduras</p>
                <p className="text-xl font-bold text-nutri-teal">{macros.fat}g</p>
                <p className="text-sm">{parseInt(fatPercentage)}% / {macros.fat * 9} kcal</p>
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
