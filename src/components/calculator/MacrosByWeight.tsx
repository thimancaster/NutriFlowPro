
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Beef, Wheat, Droplets } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/consultation';

interface MacrosByWeightProps {
  profile: Profile;
  weight: number;
  proteinRatio: number;
  lipidRatio: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
  vet: number;
}

const MacrosByWeight: React.FC<MacrosByWeightProps> = ({
  profile,
  weight,
  proteinRatio,
  lipidRatio,
  proteinGrams,
  carbsGrams,
  fatGrams,
  proteinKcal,
  carbsKcal,
  fatKcal,
  proteinPercentage,
  carbsPercentage,
  fatPercentage,
  vet
}) => {
  const profileLabels = {
    eutrofico: "Eutrófico (Peso Normal)",
    sobrepeso_obesidade: "Sobrepeso/Obesidade",
    atleta: "Atleta"
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Cálculo de Macronutrientes por Peso</CardTitle>
          <Badge variant="outline">{profileLabels[profile]}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Protein section with g/kg calculation */}
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-100">
            <div className="flex items-center gap-2">
              <Beef className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-medium text-gray-900">Proteínas</h4>
                <p className="text-sm text-gray-500">Prioridade 1</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="bg-red-100 px-2 py-1 rounded text-sm font-medium">
                    {proteinRatio} g/kg × {weight}kg = {proteinGrams}g
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>A proteína é calculada primeiro com base no peso</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="text-sm">
                {proteinKcal} kcal ({proteinPercentage}% do VET)
              </div>
            </div>
          </div>
          
          {/* Fat section with g/kg calculation */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md border border-yellow-100">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium text-gray-900">Gorduras</h4>
                <p className="text-sm text-gray-500">Prioridade 2</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="bg-yellow-100 px-2 py-1 rounded text-sm font-medium">
                    {lipidRatio} g/kg × {weight}kg = {fatGrams}g
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>A gordura é calculada em segundo lugar com base no peso</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="text-sm">
                {fatKcal} kcal ({fatPercentage}% do VET)
              </div>
            </div>
          </div>
          
          {/* Carbs section calculated by difference */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium text-gray-900">Carboidratos</h4>
                <p className="text-sm text-gray-500">Por diferença</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="bg-blue-100 px-2 py-1 rounded text-sm font-medium">
                    {vet} - ({proteinKcal} + {fatKcal}) = {carbsKcal} kcal → {carbsGrams}g
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Carboidratos são calculados por diferença do VET total</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="text-sm">
                {carbsKcal} kcal ({carbsPercentage}% do VET)
              </div>
            </div>
          </div>
          
          {/* VET summary */}
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
            <div className="font-medium">VET Total:</div>
            <div className="font-medium">{vet} kcal</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MacrosByWeight;
