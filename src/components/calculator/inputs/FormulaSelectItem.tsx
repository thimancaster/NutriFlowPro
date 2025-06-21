
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { GERFormulaInfo } from '@/types/gerFormulas';

interface FormulaSelectItemProps {
  formula: GERFormulaInfo;
  isRecommended: boolean;
}

export const FormulaSelectItem: React.FC<FormulaSelectItemProps> = ({ formula, isRecommended }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-col flex-grow pr-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{formula.name}</span>
          {isRecommended && (
            <Badge variant="info" className="text-xs">Recomendada</Badge>
          )}
          {formula.requiresBodyFat && (
            <Badge variant="outline" className="text-xs">Requer % Gordura</Badge>
          )}
        </div>
        <span className="text-xs text-gray-600">{formula.indication}</span>
      </div>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <Info className="h-4 w-4 text-gray-400 hover:text-blue-600 transition-colors shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs z-[60]">
          <p>{formula.tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
