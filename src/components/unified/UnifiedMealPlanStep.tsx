
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Utensils, Loader2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useUnifiedCalculator } from '@/hooks/useUnifiedCalculator';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import MealPlanEditor from '@/components/meal-plan/MealPlanEditor';

interface UnifiedMealPlanStepProps {
  onComplete: () => void;
}

const UnifiedMealPlanStep: React.FC<UnifiedMealPlanStepProps> = ({ onComplete }) => {
  const { calculatorData } = useUnifiedCalculator();
  const { activePatient } = usePatient();
  const { user } = useAuth();
  const { 
    currentMealPlan, 
    isGenerating, 
    error,
    generateMealPlan, 
    setPatient, 
    setCalculationData,
    clearError
  } = useMealPlanWorkflow();

  // Sincronizar dados apenas uma vez quando disponíveis
  React.useEffect(() => {
    if (activePatient) {
      console.log('🔄 Sincronizando paciente ativo:', activePatient.name);
      setPatient(activePatient);
    }
  }, [activePatient, setPatient]);

  React.useEffect(() => {
    if (calculatorData) {
      console.log('🔄 Sincronizando dados da calculadora');
      setCalculationData({
        id: calculatorData.id || `unified-${Date.now()}`,
        totalCalories: calculatorData.totalCalories,
        protein: calculatorData.protein,
        carbs: calculatorData.carbs,
        fats: calculatorData.fats,
        objective: calculatorData.objective
      });
    }
  }, [calculatorData, setCalculationData]);

  const handleGenerateMealPlan = async () => {
    if (!user?.id) {
      console.error('❌ Usuário não autenticado');
      return;
    }
    
    clearError();
    await generateMealPlan(user.id);
  };

  const handleRetry = () => {
    clearError();
    handleGenerateMealPlan();
  };

  if (!calculatorData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Complete o cálculo nutricional primeiro</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Plano Alimentar Brasileiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Metas Nutricionais</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant="outline">{calculatorData.totalCalories} kcal</Badge>
                <div className="text-sm text-muted-foreground">Calorias</div>
              </div>
              <div className="text-center">
                <Badge variant="outline">{calculatorData.protein}g</Badge>
                <div className="text-sm text-muted-foreground">Proteína</div>
              </div>
              <div className="text-center">
                <Badge variant="outline">{calculatorData.carbs}g</Badge>
                <div className="text-sm text-muted-foreground">Carboidratos</div>
              </div>
              <div className="text-center">
                <Badge variant="outline">{calculatorData.fats}g</Badge>
                <div className="text-sm text-muted-foreground">Gorduras</div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                >
                  Tentar Novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!currentMealPlan ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Gere um plano alimentar personalizado com inteligência cultural brasileira
              </p>
              <Button 
                onClick={handleGenerateMealPlan}
                disabled={isGenerating}
                size="lg"
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando Plano Inteligente...
                  </>
                ) : (
                  <>
                    <Utensils className="h-4 w-4" />
                    Gerar Plano Alimentar Brasileiro
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Plano Gerado</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateMealPlan}
                    variant="outline"
                    size="sm"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Gerar Novo
                  </Button>
                  <Button 
                    onClick={onComplete}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    Finalizar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <MealPlanEditor mealPlan={currentMealPlan} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMealPlanStep;
