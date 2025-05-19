import React from 'react';
import { 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Button
} from '../../../components/ui';
import { ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityFormProps {
  activityLevel: string;
  objective: string;
  tmbValue: number | null;
  isCalculating: boolean;
  onActivityLevelChange: (value: string) => void;
  onObjectiveChange: (value: string) => void;
  onCalculate: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  activityLevel,
  objective,
  tmbValue,
  isCalculating,
  onActivityLevelChange,
  onObjectiveChange,
  onCalculate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="activity">Nível de Atividade Física</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Sedentário: pouco ou nenhum exercício</p>
                  <p>Leve: exercício 1-3x por semana</p>
                  <p>Moderado: exercício 3-5x por semana</p>
                  <p>Intenso: exercício 6-7x por semana</p>
                  <p>Muito intenso: exercício intenso diário ou físico profissional</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={activityLevel} onValueChange={onActivityLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o nível de atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentario">Sedentário</SelectItem>
              <SelectItem value="leve">Leve</SelectItem>
              <SelectItem value="moderado">Moderado</SelectItem>
              <SelectItem value="intenso">Intenso</SelectItem>
              <SelectItem value="muito_intenso">Muito Intenso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="objective">Objetivo</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Emagrecimento: déficit calórico de 20%</p>
                  <p>Manutenção: calorias para manter o peso</p>
                  <p>Hipertrofia: superávit calórico de 15%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={objective} onValueChange={onObjectiveChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
              <SelectItem value="manutenção">Manutenção</SelectItem>
              <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col justify-between">
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-500 mb-2">Taxa Metabólica Basal (TMB)</p>
          <p className="text-2xl font-bold">{tmbValue} kcal</p>
          <p className="text-xs text-gray-500 mt-1">
            Calorias necessárias em repouso completo
          </p>
        </div>
        
        <Button 
          onClick={onCalculate} 
          className="w-full mt-4"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Calculando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Calcular Macros <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ActivityForm;
