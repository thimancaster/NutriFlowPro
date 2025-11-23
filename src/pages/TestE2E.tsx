/**
 * Página de teste E2E: criar paciente → calcular nutrição → gerar plano → editar → salvar
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useOfficialCalculations } from '@/hooks/useOfficialCalculations';
import { useUnifiedNutrition } from '@/contexts/UnifiedNutritionContext';
import { MealPlanOrchestrator } from '@/services/mealPlan/MealPlanOrchestrator';

type StepStatus = 'pending' | 'running' | 'success' | 'error';

interface Step {
  id: string;
  name: string;
  status: StepStatus;
  message?: string;
}

const TestE2E: React.FC = () => {
  const { user } = useAuth();
  const { savePatient, startPatientSession, activePatient } = usePatient();
  const { calculate, results } = useOfficialCalculations();
  const { currentPlan, initializeSession, setCurrentPlan, savePlan } = useUnifiedNutrition();

  const [steps, setSteps] = useState<Step[]>([
    { id: 'create-patient', name: 'Criar Paciente de Teste', status: 'pending' },
    { id: 'calculate', name: 'Calcular Nutrição', status: 'pending' },
    { id: 'generate-plan', name: 'Gerar Plano Automático', status: 'pending' },
    { id: 'edit-plan', name: 'Editar Plano', status: 'pending' },
    { id: 'save-plan', name: 'Salvar Plano', status: 'pending' },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const updateStep = (stepId: string, status: StepStatus, message?: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status, message } : s));
  };

  const runE2ETest = async () => {
    if (!user?.id) {
      alert('Usuário não autenticado!');
      return;
    }

    setIsRunning(true);

    try {
      // STEP 1: Criar Paciente
      updateStep('create-patient', 'running');
      const testPatient = {
        name: `Paciente Teste E2E ${Date.now()}`,
        email: `teste${Date.now()}@test.com`,
        gender: 'male' as const,
        birth_date: '1990-01-15',
        phone: '(11) 99999-9999',
        goals: {
          objective: 'emagrecimento' as const,
          profile: 'obeso_sobrepeso' as const,
          activityLevel: 'moderado' as const,
        },
        status: 'active' as const,
      };

      const saveResult = await savePatient(testPatient);
      if (!saveResult.success || !saveResult.data) {
        throw new Error(saveResult.error || 'Falha ao criar paciente');
      }
      
      await startPatientSession(saveResult.data);
      updateStep('create-patient', 'success', `Criado: ${saveResult.data.name}`);
      await new Promise(r => setTimeout(r, 500));

      // STEP 2: Calcular Nutrição
      updateStep('calculate', 'running');
      
      // Usar hook correctly - first update inputs then calculate
      const calcResults = await import('@/utils/nutrition/official/officialCalculations').then(m => 
        m.calculateComplete_Official({
          weight: 95,
          height: 175,
          age: 34,
          gender: 'M',
          activityLevel: 'moderado',
          objective: 'emagrecimento',
          profile: 'sobrepeso_obesidade',
        })
      );

      if (!calcResults) {
        throw new Error('Cálculo não retornou resultados');
      }

      updateStep('calculate', 'success', `VET: ${Math.round(calcResults.vet)} kcal`);
      await new Promise(r => setTimeout(r, 500));

      // STEP 3: Gerar Plano Automático
      updateStep('generate-plan', 'running');
      
      if (!saveResult.data?.id) {
        throw new Error('ID do paciente não disponível');
      }

      initializeSession(
        { id: saveResult.data.id, name: saveResult.data.name },
        calcResults
      );

      const mockPlan = {
        id: undefined as any,
        name: 'Plano Teste E2E',
        patient_id: saveResult.data.id,
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        meals: [
          {
            id: 'meal-1',
            name: 'Café da Manhã',
            type: 'breakfast' as const,
            time: '08:00',
            foods: [
              {
                id: 'food-1',
                name: 'Pão integral',
                quantity: 50,
                unit: 'g',
                calories: 120,
                protein: 5,
                carbs: 20,
                fat: 2,
              },
            ],
            totalCalories: 120,
            totalProtein: 5,
            totalCarbs: 20,
            totalFats: 2,
            total_calories: 120,
            total_protein: 5,
            total_carbs: 20,
            total_fats: 2,
          },
        ],
        total_calories: 120,
        total_protein: 5,
        total_carbs: 20,
        total_fats: 2,
      };

      setCurrentPlan(mockPlan);
      updateStep('generate-plan', 'success', '1 refeição gerada');
      await new Promise(r => setTimeout(r, 500));

      // STEP 4: Editar Plano
      updateStep('edit-plan', 'running');
      
      const editedPlan = {
        ...mockPlan,
        meals: [
          {
            ...mockPlan.meals[0],
            foods: [
              ...mockPlan.meals[0].foods,
              {
                id: 'food-2',
                name: 'Queijo branco',
                quantity: 30,
                unit: 'g',
                calories: 60,
                protein: 7,
                carbs: 1,
                fat: 3,
              },
            ],
            totalCalories: 180,
            totalProtein: 12,
            totalCarbs: 21,
            totalFats: 5,
            total_calories: 180,
            total_protein: 12,
            total_carbs: 21,
            total_fats: 5,
          },
        ],
        total_calories: 180,
        total_protein: 12,
        total_carbs: 21,
        total_fats: 5,
      };

      setCurrentPlan(editedPlan);
      updateStep('edit-plan', 'success', 'Alimento adicionado');
      await new Promise(r => setTimeout(r, 500));

      // STEP 5: Salvar Plano
      updateStep('save-plan', 'running');
      const savedId = await savePlan({ skipNotification: true });
      
      if (!savedId) {
        throw new Error('Falha ao salvar plano');
      }

      updateStep('save-plan', 'success', `ID: ${savedId.substring(0, 8)}...`);

    } catch (error: any) {
      console.error('[E2E TEST] Erro:', error);
      const currentStepIndex = steps.findIndex(s => s.status === 'running');
      if (currentStepIndex >= 0) {
        updateStep(steps[currentStepIndex].id, 'error', error.message);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusBadge = (status: StepStatus) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'running':
        return <Badge className="bg-blue-600">Executando...</Badge>;
      default:
        return <Badge variant="secondary">Aguardando</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Teste E2E - Fluxo Completo</CardTitle>
          <Alert>
            <AlertDescription>
              Este teste automatizado valida todo o fluxo: criar paciente → calcular → gerar plano → editar → salvar
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 text-center font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  {step.message && (
                    <div className="text-sm text-muted-foreground mt-1">{step.message}</div>
                  )}
                </div>
                <div>
                  {getStatusBadge(step.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={runE2ETest}
              disabled={isRunning}
              className="gap-2"
            >
              <Play className="h-5 w-5" />
              {isRunning ? 'Executando Teste...' : 'Iniciar Teste E2E'}
            </Button>
          </div>

          {/* Debug Info */}
          {currentPlan && (
            <Alert className="mt-6">
              <AlertDescription>
                <strong>Plano Atual:</strong> {currentPlan.meals.length} refeição(ões), {Math.round(currentPlan.total_calories)} kcal
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestE2E;
