
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Percent, Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface MacroDistributionInputsProps {
  carbsPercentage: string;
  setCarbsPercentage: (value: string) => void;
  proteinPercentage: string;
  setProteinPercentage: (value: string) => void;
  fatPercentage: string;
  setFatPercentage: (value: string) => void;
  bmr: number;
  tee: number;
  objective: string;
}

const MacroDistributionInputs: React.FC<MacroDistributionInputsProps> = ({
  carbsPercentage,
  setCarbsPercentage,
  proteinPercentage,
  setProteinPercentage,
  fatPercentage,
  setFatPercentage,
  bmr,
  tee,
  objective
}) => {
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  
  // Update total percentage when any macro percentage changes
  useEffect(() => {
    const carbs = parseInt(carbsPercentage) || 0;
    const protein = parseInt(proteinPercentage) || 0;
    const fat = parseInt(fatPercentage) || 0;
    setTotalPercentage(carbs + protein + fat);
  }, [carbsPercentage, proteinPercentage, fatPercentage]);
  
  // Check if total is within acceptable range
  const isValidTotal = totalPercentage >= 99 && totalPercentage <= 101; // Allow small rounding errors
  
  // Get automatic distribution recommendations for guidance
  let recommendedDistribution = { protein: 25, carbs: 50, fat: 25 };
  
  switch (objective) {
    case 'emagrecimento':
      recommendedDistribution = { protein: 30, carbs: 40, fat: 30 };
      break;
    case 'hipertrofia':
      recommendedDistribution = { protein: 30, carbs: 50, fat: 20 };
      break;
    case 'manutenção':
    default:
      recommendedDistribution = { protein: 25, carbs: 50, fat: 25 };
      break;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Ajuste Manual de Macronutrientes</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-nutri-blue opacity-70" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Você pode ajustar manualmente as porcentagens de macronutrientes.
                  <br/>
                  A distribuição deve totalizar 100%.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {(bmr && tee) ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              {/* Protein */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="proteinPercentage" className="text-sm font-medium">Proteína</Label>
                  <span className="text-xs text-gray-500">Recomendado: {recommendedDistribution.protein}%</span>
                </div>
                <div className="relative">
                  <Input
                    id="proteinPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={proteinPercentage}
                    onChange={(e) => setProteinPercentage(e.target.value)}
                    className="pr-8"
                  />
                  <Percent className="h-4 w-4 absolute right-2 top-2.5 text-gray-400" />
                </div>
              </div>
              
              {/* Carbs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="carbsPercentage" className="text-sm font-medium">Carboidratos</Label>
                  <span className="text-xs text-gray-500">Recomendado: {recommendedDistribution.carbs}%</span>
                </div>
                <div className="relative">
                  <Input
                    id="carbsPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={carbsPercentage}
                    onChange={(e) => setCarbsPercentage(e.target.value)}
                    className="pr-8"
                  />
                  <Percent className="h-4 w-4 absolute right-2 top-2.5 text-gray-400" />
                </div>
              </div>
              
              {/* Fat */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fatPercentage" className="text-sm font-medium">Gorduras</Label>
                  <span className="text-xs text-gray-500">Recomendado: {recommendedDistribution.fat}%</span>
                </div>
                <div className="relative">
                  <Input
                    id="fatPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={fatPercentage}
                    onChange={(e) => setFatPercentage(e.target.value)}
                    className="pr-8"
                  />
                  <Percent className="h-4 w-4 absolute right-2 top-2.5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Total percentage indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total:</span>
                <span className={`font-medium ${isValidTotal ? 'text-green-600' : 'text-red-500'}`}>
                  {totalPercentage}%
                </span>
              </div>
              
              <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isValidTotal ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                ></div>
              </div>
              
              {!isValidTotal && (
                <Alert className="mt-3 bg-yellow-50 text-amber-800 border-amber-200">
                  <AlertDescription>
                    Os percentuais de macronutrientes devem somar 100%.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>Calcule a TMB e o GET primeiro para ajustar macronutrientes</p>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          <p>
            Para ajustes mais específicos, você pode editar manualmente as porcentagens acima, 
            mas certifique-se de que somem 100%.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MacroDistributionInputs;
