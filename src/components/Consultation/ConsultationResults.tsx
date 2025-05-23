import React from 'react';
import { Button } from '@/components/ui/button';
import { ConsultationData } from '@/types';

interface ConsultationResultsProps {
  results?: {
    bmr: number;
    get: number;
    vet: number;
    adjustment: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      proteinPerKg?: number;
    };
  };
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

const ConsultationResults: React.FC<ConsultationResultsProps> = ({ 
  results, 
  onSave,
  isSaving
}) => {
  if (!results) {
    return <div className="text-center py-8">No results available</div>;
  }

  const displayResults = {
    tmb: results.bmr,
    fa: results.vet || 0,
    get: results.get,
    macros: {
      protein: results.macros.protein,
      carbs: results.macros.carbs,
      fat: results.macros.fat
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-nutri-gray-light rounded-xl p-4 text-center">
          <h3 className="text-sm text-gray-500 mb-1">Taxa Metabólica Basal</h3>
          <p className="text-3xl font-bold text-nutri-blue">{displayResults.tmb}</p>
          <p className="text-sm text-gray-500">kcal/dia</p>
        </div>
        
        <div className="bg-nutri-gray-light rounded-xl p-4 text-center">
          <h3 className="text-sm text-gray-500 mb-1">Fator de Atividade</h3>
          <p className="text-3xl font-bold text-nutri-green">{displayResults.fa}</p>
        </div>
        
        <div className="bg-nutri-gray-light rounded-xl p-4 text-center">
          <h3 className="text-sm text-gray-500 mb-1">Gasto Energético Total</h3>
          <p className="text-3xl font-bold text-purple-600">{displayResults.get}</p>
          <p className="text-sm text-gray-500">kcal/dia</p>
        </div>
      </div>
      
      <h3 className="font-medium text-lg mb-4">Distribuição de Macronutrientes</h3>
      
      <div className="space-y-6">
        <MacroProgressBar 
          label="Proteínas"
          value={displayResults.macros.protein}
          totalMacros={displayResults.macros.protein + displayResults.macros.carbs + displayResults.macros.fat}
          totalCalories={displayResults.get}
          caloriesPerGram={4}
          colorClass="bg-nutri-blue"
        />
        
        <MacroProgressBar 
          label="Carboidratos"
          value={displayResults.macros.carbs}
          totalMacros={displayResults.macros.protein + displayResults.macros.carbs + displayResults.macros.fat}
          totalCalories={displayResults.get}
          caloriesPerGram={4}
          colorClass="bg-nutri-green"
        />
        
        <MacroProgressBar 
          label="Gorduras"
          value={displayResults.macros.fat}
          totalMacros={displayResults.macros.protein + displayResults.macros.carbs + displayResults.macros.fat}
          totalCalories={displayResults.get}
          caloriesPerGram={9}
          colorClass="bg-amber-500"
        />
      </div>

      {onSave && (
        <div className="mt-8">
          <Button 
            onClick={onSave} 
            disabled={isSaving} 
            className="w-full"
          >
            {isSaving ? 'Salvando...' : 'Salvar Consulta'}
          </Button>
        </div>
      )}
    </>
  );
};

interface MacroProgressBarProps {
  label: string;
  value: number;
  totalMacros: number;
  totalCalories: number;
  caloriesPerGram: number;
  colorClass: string;
}

const MacroProgressBar: React.FC<MacroProgressBarProps> = ({ 
  label, 
  value, 
  totalMacros, 
  totalCalories, 
  caloriesPerGram,
  colorClass 
}) => {
  const percentOfTotal = Math.min(100, (value * 100) / totalMacros);
  const percentOfCalories = Math.round((value * caloriesPerGram * 100) / totalCalories);
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-medium">{value}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${colorClass} h-2.5 rounded-full`} 
          style={{ width: `${percentOfTotal}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {percentOfCalories}% do total de calorias
      </div>
    </div>
  );
};

export default ConsultationResults;
