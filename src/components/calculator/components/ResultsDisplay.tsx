
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck, Dumbbell, FileText, InfoIcon, Utensils } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export interface ResultsDisplayProps {
  teeObject: {
    get: number;
    adjustment: number;
    vet: number;
  };
  macros: any; // Using any temporarily for simplicity
  calorieSummary: any;
  objective: string;
  onSavePatient: () => Promise<void>;
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
  const getObjectiveLabel = (obj: string) => {
    switch (obj) {
      case 'cutting':
        return 'Emagrecimento';
      case 'maintenance':
        return 'Manutenção';
      case 'bulking':
        return 'Hipertrofia';
      default:
        return 'Personalizado';
    }
  };

  const getObjectiveBadgeVariant = (obj: string) => {
    switch (obj) {
      case 'cutting':
        return 'destructive';
      case 'maintenance':
        return 'outline';
      case 'bulking':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Taxa Metabólica Basal</h3>
              <Dumbbell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-nutri-blue">{teeObject.get} kcal</div>
            <div className="text-sm text-gray-500 mt-1">
              Energia necessária para funções vitais
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">
                Ajuste para {getObjectiveLabel(objective)}
              </h3>
              <Badge variant={getObjectiveBadgeVariant(objective)}>
                {teeObject.adjustment > 0 ? '+' : ''}{teeObject.adjustment}%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-nutri-teal">{teeObject.vet} kcal</div>
            <div className="text-sm text-gray-500 mt-1">
              VET (Valor Energético Total)
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Distribuição de Macronutrientes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Proteínas</h4>
                <Badge variant="outline">{macros.protein.percentage}%</Badge>
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-600">{macros.protein.grams}g</div>
              <div className="text-sm text-gray-500 mt-1">{macros.protein.kcal} kcal</div>
              {macros.proteinPerKg && (
                <div className="text-xs text-gray-500 mt-2 italic">
                  {macros.proteinPerKg}g/kg de peso corporal
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Carboidratos</h4>
                <Badge variant="outline">{macros.carbs.percentage}%</Badge>
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-600">{macros.carbs.grams}g</div>
              <div className="text-sm text-gray-500 mt-1">{macros.carbs.kcal} kcal</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Gorduras</h4>
                <Badge variant="outline">{macros.fat.percentage}%</Badge>
              </div>
              <div className="mt-2 text-2xl font-bold text-purple-600">{macros.fat.grams}g</div>
              <div className="text-sm text-gray-500 mt-1">{macros.fat.kcal} kcal</div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium">Balanço Calórico</h3>
              <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Objetivo</div>
                <div className="font-semibold">{calorieSummary.targetCalories} kcal</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Alocado</div>
                <div className="font-semibold">{calorieSummary.actualCalories} kcal</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Diferença</div>
                <div className={`font-semibold ${Math.abs(calorieSummary.difference) > 10 ? 'text-amber-600' : 'text-green-600'}`}>
                  {calorieSummary.difference > 0 ? '+' : ''}{calorieSummary.difference} kcal
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Desvio</div>
                <div className={`font-semibold ${Math.abs(calorieSummary.percentageDifference) > 2 ? 'text-amber-600' : 'text-green-600'}`}>
                  {calorieSummary.percentageDifference > 0 ? '+' : ''}{calorieSummary.percentageDifference.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="default" className="bg-green-50 border-green-200">
        <CircleCheck className="h-4 w-4 text-green-500" />
        <AlertDescription className="flex justify-between items-center">
          <span>Cálculo concluído com sucesso! O que deseja fazer a seguir?</span>
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onSavePatient}
        >
          <FileText className="h-4 w-4" />
          Salvar Resultados
        </Button>
        
        <Button 
          variant="nutri"
          className="flex items-center gap-2"
          onClick={onGenerateMealPlan}
        >
          <Utensils className="h-4 w-4" />
          Gerar Plano Alimentar
        </Button>
      </div>
    </div>
  );
};
