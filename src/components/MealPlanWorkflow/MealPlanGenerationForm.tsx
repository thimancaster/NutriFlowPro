
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Utensils, Calculator, RefreshCw } from 'lucide-react';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';

interface MealPlanGenerationFormProps {
  onGenerate: () => void;
  isGenerating?: boolean;
  canGenerate?: boolean;
  validationMessage?: string;
  patientName?: string;
  calculationData?: {
    totalCalories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const MealPlanGenerationForm: React.FC<MealPlanGenerationFormProps> = ({ 
  onGenerate,
  isGenerating = false,
  canGenerate = true,
  validationMessage,
  patientName = 'Paciente',
  calculationData
}) => {
  const { calculationStatus, autoCalculateNutrition, error } = useMealPlanWorkflow();

  console.log('[WORKFLOW:PLAN] 🎛️ MealPlanGenerationForm render:', {
    calculationStatus,
    canGenerate,
    hasCalculationData: !!calculationData,
    validationMessage
  });

  const handleCalculateNow = async () => {
    console.log('[WORKFLOW:PLAN] 🧮 Botão "Calcular agora" clicado');
    await autoCalculateNutrition();
  };

  const isCalculating = calculationStatus === 'loading';
  const isReady = calculationStatus === 'ready';
  const hasError = calculationStatus === 'error' || !!error;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <Utensils className="mx-auto h-12 w-12 text-primary mb-3" />
            <h3 className="text-lg font-semibold">Gerar Plano Alimentar Brasileiro</h3>
            <p className="text-muted-foreground">
              Configure os parâmetros para gerar um novo plano alimentar para <strong>{patientName}</strong>.
            </p>
          </div>

          {/* Status do Cálculo */}
          {isCalculating && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Calculando necessidades nutricionais...</span>
              </div>
              <p className="text-blue-600 text-sm text-center mt-1">
                Analisando dados do paciente para determinar metas ideais
              </p>
            </div>
          )}

          {/* Erro no Cálculo */}
          {hasError && !isCalculating && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error || validationMessage}</span>
                <Button
                  onClick={handleCalculateNow}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Calcular agora
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Dados de Cálculo Prontos */}
          {calculationData && isReady && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">📊 Metas Nutricionais</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                <div>Calorias: <span className="font-medium">{calculationData.totalCalories} kcal</span></div>
                <div>Proteínas: <span className="font-medium">{calculationData.protein}g</span></div>
                <div>Carboidratos: <span className="font-medium">{calculationData.carbs}g</span></div>
                <div>Gorduras: <span className="font-medium">{calculationData.fats}g</span></div>
              </div>
            </div>
          )}

          {/* Sem Dados de Cálculo */}
          {!calculationData && !isCalculating && !hasError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Dados de cálculo nutricional necessários para gerar o plano</span>
                <Button
                  onClick={handleCalculateNow}
                  variant="outline"
                  size="sm"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Calcular agora
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Botão Principal */}
          <Button 
            onClick={onGenerate} 
            disabled={!canGenerate || isGenerating || isCalculating || !isReady}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Plano com Inteligência Cultural...
              </>
            ) : isCalculating ? (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calculando necessidades nutricionais...
              </>
            ) : (
              <>
                <Utensils className="mr-2 h-4 w-4" />
                Gerar Plano Alimentar Brasileiro
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="text-center text-sm text-muted-foreground">
              <p>🧠 Aplicando inteligência cultural brasileira...</p>
              <p>🍽️ Criando refeições balanceadas...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanGenerationForm;
