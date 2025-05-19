
import React from 'react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface MacroDistributionGridProps {
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
  };
  proteinPerKg?: number;
  weight: number;
}

const MacroDistributionGrid: React.FC<MacroDistributionGridProps> = ({ 
  macros,
  proteinPerKg,
  weight
}) => {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-4 gap-2 font-medium text-sm text-gray-500 mb-2">
        <div>Nutriente</div>
        <div className="text-center">Gramas</div>
        <div className="text-center">kcal</div>
        <div className="text-center">%</div>
      </div>
      
      {/* Protein Row */}
      <div className="grid grid-cols-4 gap-2 py-3 border-t">
        <div className="flex items-center">
          <span className="font-medium">Proteína</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 ml-1 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {proteinPerKg?.toFixed(1) || '0'} g/kg de peso corporal 
                  <br />
                  Total: {macros.protein.grams}g
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-center font-semibold">{macros.protein.grams}g</div>
        <div className="text-center">{macros.protein.kcal}</div>
        <div className="text-center">{macros.protein.percentage}%</div>
      </div>
      
      {/* Carbs Row */}
      <div className="grid grid-cols-4 gap-2 py-3 border-t">
        <div className="flex items-center">
          <span className="font-medium">Carboidrato</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 ml-1 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Calculado como resto calórico
                  <br />
                  {(macros.carbs.grams / weight).toFixed(1)} g/kg de peso corporal
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-center font-semibold">{macros.carbs.grams}g</div>
        <div className="text-center">{macros.carbs.kcal}</div>
        <div className="text-center">{macros.carbs.percentage}%</div>
      </div>
      
      {/* Fat Row */}
      <div className="grid grid-cols-4 gap-2 py-3 border-t">
        <div className="flex items-center">
          <span className="font-medium">Lipídio</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 ml-1 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {(macros.fat.grams / weight).toFixed(1)} g/kg de peso corporal
                  <br />
                  Total: {macros.fat.grams}g
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-center font-semibold">{macros.fat.grams}g</div>
        <div className="text-center">{macros.fat.kcal}</div>
        <div className="text-center">{macros.fat.percentage}%</div>
      </div>
    </div>
  );
};

export default MacroDistributionGrid;
