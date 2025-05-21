
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Save, UtensilsCrossed } from 'lucide-react';

export interface ResultsDisplayProps {
  teeObject: {
    get: number;
    adjustment: number;
    vet: number;
  };
  macros: any;
  calorieSummary: any;
  objective: string;
  onSavePatient: () => void;
  onGenerateMealPlan: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  teeObject,
  macros,
  calorieSummary,
  objective,
  onSavePatient,
  onGenerateMealPlan
}) => {
  if (!teeObject || !macros) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">TMB</h3>
            <p className="text-2xl font-bold">{teeObject.get} kcal</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">
              Ajuste ({objective === 'emagrecimento' ? '-20%' : 
                       objective === 'hipertrofia' ? '+15%' : '0%'})
            </h3>
            <p className="text-2xl font-bold">{teeObject.adjustment} kcal</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">VET (Total)</h3>
            <p className="text-2xl font-bold">{teeObject.vet} kcal</p>
          </div>
        </Card>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Distribuição de Macronutrientes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Proteínas</h4>
            <p className="text-xl font-bold">{macros.protein.grams}g</p>
            <p className="text-sm text-gray-500">
              {macros.protein.kcal} kcal ({macros.protein.percentage}%)
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Carboidratos</h4>
            <p className="text-xl font-bold">{macros.carbs.grams}g</p>
            <p className="text-sm text-gray-500">
              {macros.carbs.kcal} kcal ({macros.carbs.percentage}%)
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Gorduras</h4>
            <p className="text-xl font-bold">{macros.fat.grams}g</p>
            <p className="text-sm text-gray-500">
              {macros.fat.kcal} kcal ({macros.fat.percentage}%)
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-end">
        <Button 
          variant="outline" 
          onClick={onSavePatient}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Salvar Resultados
        </Button>
        
        <Button 
          variant="nutri" 
          onClick={onGenerateMealPlan}
          className="flex items-center gap-2"
        >
          <UtensilsCrossed className="h-4 w-4" />
          Gerar Plano Alimentar
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
