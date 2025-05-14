
import React from 'react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

interface MacroDistributionGridProps {
  macros: {
    carbs: number;
    protein: number;
    fat: number;
    proteinPerKg?: number;
  };
  carbsPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
  proteinReferenceRange: {
    min: number;
    max: number;
  };
}

const MacroDistributionGrid = ({
  macros,
  carbsPercentage,
  proteinPercentage,
  fatPercentage,
  proteinReferenceRange
}: MacroDistributionGridProps) => {
  return (
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
  );
};

export default MacroDistributionGrid;
