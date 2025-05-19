
import React from 'react';
import {
  Card,
  CardContent
} from '@/components/ui';
import { InfoIcon } from 'lucide-react';

interface ResultsDisplayProps {
  teeObject: {
    get: number;
    adjustment: number;
    vet: number;
  } | null;
  macros: {
    protein: {
      grams: number;
      kcal: number;
      percentage: number;
      perKg: number;
    };
    carbs: {
      grams: number;
      kcal: number;
      percentage: number;
    };
    fat: {
      grams: number;
      kcal: number;
      percentage: number;
      perKg: number;
    };
  } | null;
  calorieSummary: {
    targetCalories: number;
    actualCalories: number;
    difference: number;
    percentageDifference: number;
  } | null;
  objective: string;
  weight: number | '';
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  teeObject,
  macros,
  calorieSummary,
  objective,
  weight
}) => {
  console.log("Results Display Props:", { teeObject, macros, calorieSummary, objective, weight });

  if (!teeObject || !macros || !calorieSummary) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-500">Nenhum resultado disponível. Por favor, calcule primeiro.</p>
        </CardContent>
      </Card>
    );
  }

  const getObjectiveLabel = (obj: string): string => {
    switch (obj) {
      case 'emagrecimento': return 'Emagrecimento';
      case 'hipertrofia': return 'Hipertrofia';
      case 'manutenção': return 'Manutenção';
      default: return obj;
    }
  };

  const getObjectiveColor = (obj: string): string => {
    switch (obj) {
      case 'emagrecimento': return 'text-blue-600';
      case 'hipertrofia': return 'text-green-600';
      case 'manutenção': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* VET Results */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium mb-4">Resultados Energéticos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500 mb-1">GET (Gasto Energético Total)</div>
            <div className="text-xl font-bold">{teeObject.get} kcal</div>
            <div className="text-xs text-gray-500">Necessidade de manutenção</div>
          </div>
          
          <div className={`bg-gray-50 p-4 rounded-md ${getObjectiveColor(objective)}`}>
            <div className="text-sm text-gray-500 mb-1">
              Ajuste ({getObjectiveLabel(objective)})
            </div>
            <div className="text-xl font-bold">
              {teeObject.adjustment > 0 ? '+' : ''}{teeObject.adjustment} kcal
            </div>
            <div className="text-xs text-gray-500">
              {teeObject.adjustment > 0 ? 'Superávit calórico' : 'Déficit calórico'}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="text-sm text-gray-500 mb-1">VET (Valor Energético Total)</div>
            <div className="text-xl font-bold text-blue-700">{teeObject.vet} kcal</div>
            <div className="text-xs text-gray-500">Meta calórica diária</div>
          </div>
        </div>
      </div>
      
      {/* Macronutrients Results */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium mb-4">Distribuição de Macronutrientes</h3>
        
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-amber-50 p-2 rounded">
            <div className="text-xs text-gray-500">Proteínas</div>
            <div className="font-semibold">{macros.protein.percentage}%</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xs text-gray-500">Carboidratos</div>
            <div className="font-semibold">{macros.carbs.percentage}%</div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-xs text-gray-500">Gorduras</div>
            <div className="font-semibold">{macros.fat.percentage}%</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Proteínas</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                {macros.protein.perKg}g/kg
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-600">{macros.protein.grams}g</div>
            <div className="text-xs text-gray-500">{macros.protein.kcal} kcal</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Carboidratos</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                {weight && macros.carbs.grams ? (macros.carbs.grams / Number(weight)).toFixed(1) : '0'}g/kg
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{macros.carbs.grams}g</div>
            <div className="text-xs text-gray-500">{macros.carbs.kcal} kcal</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Gorduras</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                {macros.fat.perKg}g/kg
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{macros.fat.grams}g</div>
            <div className="text-xs text-gray-500">{macros.fat.kcal} kcal</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 flex items-start gap-2 bg-gray-50 p-3 rounded">
          <InfoIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p>Calorias totais: {calorieSummary.actualCalories} de {calorieSummary.targetCalories} kcal ({calorieSummary.percentageDifference}% de diferença)</p>
            <p className="mt-1">Cálculo baseado no perfil corporal selecionado usando valores de g/kg específicos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
