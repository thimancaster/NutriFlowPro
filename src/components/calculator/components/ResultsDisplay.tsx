
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Activity, 
  Utensils, 
  Save, 
  Info 
} from 'lucide-react';

interface ResultsDisplayProps {
  teeObject: any;
  macros: any;
  calorieSummary: any;
  objective: string;
  formulaUsed?: string;
  proteinPerKg?: number;
  onSavePatient: () => void;
  onGenerateMealPlan: () => void;
  isSaving: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  teeObject,
  macros,
  calorieSummary,
  objective,
  formulaUsed,
  proteinPerKg,
  onSavePatient,
  onGenerateMealPlan,
  isSaving
}) => {
  if (!teeObject || !macros) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Execute o cálculo para visualizar os resultados</p>
      </div>
    );
  }

  const getObjectiveColor = (obj: string) => {
    switch (obj) {
      case 'emagrecimento': return 'bg-red-100 text-red-800';
      case 'hipertrofia': return 'bg-green-100 text-green-800';
      case 'manutenção': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getObjectiveLabel = (obj: string) => {
    switch (obj) {
      case 'emagrecimento': return 'Emagrecimento';
      case 'hipertrofia': return 'Hipertrofia';
      case 'manutenção': return 'Manutenção';
      default: return obj;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com fórmula utilizada */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="h-5 w-5" />
              Resultados do Cálculo Nutricional
            </CardTitle>
            <Badge className={getObjectiveColor(objective)}>
              {getObjectiveLabel(objective)}
            </Badge>
          </div>
          {formulaUsed && (
            <p className="text-sm text-blue-600 mt-2">
              <strong>Fórmula utilizada:</strong> {formulaUsed}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Resultados Energéticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              TMB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {teeObject.tmb || teeObject.bmr} kcal
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Taxa Metabólica Basal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              GET
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teeObject.get} kcal
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gasto Energético Total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              VET
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {teeObject.vet} kcal
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Valor Energético Total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Macronutrientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Distribuição de Macronutrientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Proteínas */}
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {macros.protein?.grams || macros.protein}g
              </div>
              <div className="text-sm text-gray-600 mb-1">Proteínas</div>
              <div className="text-xs text-gray-500">
                {macros.protein?.kcal && `${macros.protein.kcal} kcal`}
                {macros.protein?.percentage && ` (${macros.protein.percentage}%)`}
              </div>
              {proteinPerKg && (
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  {proteinPerKg}g/kg de peso
                </div>
              )}
            </div>

            {/* Carboidratos */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {macros.carbs?.grams || macros.carbs}g
              </div>
              <div className="text-sm text-gray-600 mb-1">Carboidratos</div>
              <div className="text-xs text-gray-500">
                {macros.carbs?.kcal && `${macros.carbs.kcal} kcal`}
                {macros.carbs?.percentage && ` (${macros.carbs.percentage}%)`}
              </div>
            </div>

            {/* Gorduras */}
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {macros.fat?.grams || macros.fat}g
              </div>
              <div className="text-sm text-gray-600 mb-1">Gorduras</div>
              <div className="text-xs text-gray-500">
                {macros.fat?.kcal && `${macros.fat.kcal} kcal`}
                {macros.fat?.percentage && ` (${macros.fat.percentage}%)`}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Resumo Visual */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Total de Calorias:</span>
              <span className="font-semibold">{teeObject.vet} kcal/dia</span>
            </div>
            
            {/* Barra de Progresso dos Macros */}
            <div className="w-full bg-gray-200 rounded-full h-4 flex overflow-hidden">
              <div 
                className="bg-red-500 h-full flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${macros.protein?.percentage || 20}%` }}
              >
                P
              </div>
              <div 
                className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${macros.carbs?.percentage || 50}%` }}
              >
                C
              </div>
              <div 
                className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${macros.fat?.percentage || 30}%` }}
              >
                G
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onSavePatient}
          disabled={isSaving}
          variant="outline"
          className="flex-1"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Cálculo'}
        </Button>
        
        <Button 
          onClick={onGenerateMealPlan}
          disabled={isSaving}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Utensils className="mr-2 h-4 w-4" />
          Gerar Plano Alimentar
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
