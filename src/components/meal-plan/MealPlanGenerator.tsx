
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Utensils, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useUnifiedEcosystem } from '@/contexts/UnifiedEcosystemContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MealPlanEditor from './MealPlanEditor';
import NutritionalSummary from './NutritionalSummary';

const MealPlanGenerator: React.FC = () => {
  const { 
    state, 
    generateMealPlan, 
    validateForMealPlan,
    setCurrentStep 
  } = useUnifiedEcosystem();
  
  const { 
    activePatient, 
    consultationData, 
    mealPlan, 
    isLoading, 
    error 
  } = state;

  // Validar dados necessários
  const validation = validateForMealPlan();

  // Redirecionar para etapa apropriada se dados estiverem faltando
  useEffect(() => {
    if (!activePatient) {
      setCurrentStep('patient');
    } else if (!consultationData?.results) {
      setCurrentStep('calculation');
    }
  }, [activePatient, consultationData, setCurrentStep]);

  const handleGeneratePlan = async () => {
    await generateMealPlan();
  };

  if (!activePatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
          <h3 className="text-lg font-medium">Nenhum Paciente Selecionado</h3>
          <p className="text-muted-foreground">
            Selecione um paciente para gerar o plano alimentar
          </p>
          <Button onClick={() => setCurrentStep('patient')}>
            Selecionar Paciente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!consultationData?.results) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
          <h3 className="text-lg font-medium">Dados de Consulta Incompletos</h3>
          <p className="text-muted-foreground">
            Complete a avaliação nutricional para gerar o plano alimentar
          </p>
          <Button onClick={() => setCurrentStep('calculation')}>
            Ir para Calculadora
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (mealPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Plano Alimentar Brasileiro - {activePatient.name}
          </h2>
          <Button 
            onClick={handleGeneratePlan} 
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Gerar Novo Plano
          </Button>
        </div>

        <NutritionalSummary 
          targets={{
            calories: consultationData.results.vet,
            protein: consultationData.results.macros.protein,
            carbs: consultationData.results.macros.carbs,
            fats: consultationData.results.macros.fat,
          }}
          current={{
            calories: mealPlan.total_calories,
            protein: mealPlan.total_protein,
            carbs: mealPlan.total_carbs,
            fats: mealPlan.total_fats,
          }}
        />

        <MealPlanEditor mealPlan={mealPlan} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-nutri-green" />
            Gerador de Plano Alimentar com Inteligência Cultural
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!validation.isValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Problemas encontrados: {validation.issues.join('. ')}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Paciente: {activePatient.name}
              </h3>
              <p className="text-gray-600">
                Gere automaticamente um plano alimentar personalizado seguindo 
                os costumes alimentares brasileiros
              </p>
            </div>

            {consultationData?.results && (
              <NutritionalSummary 
                targets={{
                  calories: consultationData.results.vet,
                  protein: consultationData.results.macros.protein,
                  carbs: consultationData.results.macros.carbs,
                  fats: consultationData.results.macros.fat,
                }}
              />
            )}

            <div className="mt-6">
              <Button 
                onClick={handleGeneratePlan}
                disabled={isLoading || !validation.isValid}
                size="lg"
                className="w-full max-w-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando plano inteligente...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Gerar Plano Alimentar Brasileiro
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-800">
                <p className="font-medium mb-2">🧠 Inteligência Cultural Brasileira:</p>
                <ul className="text-left space-y-1">
                  <li>• Café da manhã: Pães, cereais, frutas e laticínios</li>
                  <li>• Almoço: Arroz, feijão, carnes e verduras</li>
                  <li>• Jantar: Refeições mais leves e saudáveis</li>
                  <li>• Lanches: Frutas, iogurtes e oleaginosas</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanGenerator;
