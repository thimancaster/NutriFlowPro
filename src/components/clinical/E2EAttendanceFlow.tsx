
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useConsolidatedNutrition } from '@/hooks/useConsolidatedNutrition';
import { MealPlanOrchestrator } from '@/services/mealPlan/MealPlanOrchestrator';
import { ConsultationService } from '@/services/consultationService';
import { PatientInput } from '@/types';

interface E2EAttendanceFlowProps {
  patientId: string;
  onComplete?: () => void;
}

const E2EAttendanceFlow: React.FC<E2EAttendanceFlowProps> = ({ patientId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'loading' | 'calculation' | 'meal-plan' | 'finalization' | 'completed'>('loading');
  const [mealPlanId, setMealPlanId] = useState<string>();
  const [consultationId, setConsultationId] = useState<string>();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    state: nutritionState,
    calculateFromPatient,
    savePatientChanges,
    isReady,
    isLoading,
    hasError
  } = useConsolidatedNutrition();

  // Auto-trigger calculation when patient is selected
  useEffect(() => {
    if (patientId && currentStep === 'loading') {
      console.log('[ATTEND:E2E] Patient selected, starting auto-calculation');
      calculateFromPatient(patientId);
      setCurrentStep('calculation');
    }
  }, [patientId, calculateFromPatient, currentStep]);

  // Auto-progress to meal plan generation when calculation is ready
  useEffect(() => {
    if (isReady && currentStep === 'calculation') {
      console.log('[ATTEND:E2E] Calculation ready, enabling meal plan generation');
      setCurrentStep('meal-plan');
    }
  }, [isReady, currentStep]);

  const handleGenerateMealPlan = async () => {
    if (!nutritionState.calculationId || !nutritionState.targets) {
      toast({
        title: "Erro",
        description: "Cálculo nutricional não disponível. Execute o cálculo primeiro.",
        variant: "destructive"
      });
      return;
    }

    console.log('[ATTEND:E2E] Generating meal plan');
    
    try {
      const userId = '';
      const result = await MealPlanOrchestrator.generateAutomaticPlan({
        patientId,
        userId,
        calculationResults: nutritionState as any
      });

      if (result && result.id) {
        setMealPlanId(result.id);
        setCurrentStep('finalization');
        
        toast({
          title: "Plano gerado",
          description: "Plano alimentar gerado com sucesso!",
        });
      } else {
        throw new Error('Erro ao gerar plano');
      }
    } catch (error: any) {
      console.error('[ATTEND:E2E] Error generating meal plan:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleFinalizeConsultation = async () => {
    if (!nutritionState.result || !mealPlanId) {
      toast({
        title: "Erro",
        description: "Dados incompletos para finalizar consulta.",
        variant: "destructive"
      });
      return;
    }

    console.log('[ATTEND:E2E] Finalizing consultation');

    try {
      const consultationResult = await ConsultationService.create({
        patient_id: patientId,
        calculation_id: nutritionState.calculationId,
        meal_plan_id: mealPlanId,
        date: new Date().toISOString().split('T')[0],
        metrics: {
          weight: nutritionState.result.targets.calories, // This should come from patient data
          height: 170, // This should come from patient data
          bmi: 22, // Calculate from weight/height
          objective: 'manutencao', // This should come from patient data
          bmr: nutritionState.result.bmr,
          tdee: nutritionState.result.get,
          protein: nutritionState.result.targets.protein,
          carbs: nutritionState.result.targets.carbs,
          fats: nutritionState.result.targets.fats
        },
        notes: 'Consulta finalizada via fluxo E2E'
      });

      if (consultationResult.success) {
        setConsultationId(consultationResult.data?.id);
        setCurrentStep('completed');
        
        console.log('[ATTEND:E2E] Consultation finalized successfully');
        
        toast({
          title: "Consulta finalizada",
          description: "Atendimento concluído com sucesso!",
        });

        onComplete?.();
      } else {
        throw new Error(consultationResult.error || 'Erro ao finalizar consulta');
      }
    } catch (error: any) {
      console.error('[ATTEND:E2E] Error finalizing consultation:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStepStatus = (step: string) => {
    const stepOrder = ['calculation', 'meal-plan', 'finalization', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Atendimento E2E</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Step 1: Calculation */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">1. Cálculo Nutricional</h3>
                <p className="text-sm text-gray-600">Dados carregados e cálculo executado automaticamente</p>
              </div>
              <Badge variant={getStepStatus('calculation') === 'completed' ? 'default' : 'secondary'}>
                {isLoading ? 'Calculando...' : isReady ? 'Concluído' : hasError ? 'Erro' : 'Aguardando'}
              </Badge>
            </div>

            {/* Step 2: Meal Plan */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">2. Geração do Plano Alimentar</h3>
                <p className="text-sm text-gray-600">Plano baseado nos targets calculados</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStepStatus('meal-plan') === 'completed' ? 'default' : 'secondary'}>
                  {mealPlanId ? 'Concluído' : 'Pendente'}
                </Badge>
                {currentStep === 'meal-plan' && (
                  <Button onClick={handleGenerateMealPlan} size="sm">
                    Gerar Plano
                  </Button>
                )}
              </div>
            </div>

            {/* Step 3: Finalization */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">3. Finalização da Consulta</h3>
                <p className="text-sm text-gray-600">Registro da consulta e atualização do histórico</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStepStatus('finalization') === 'completed' ? 'default' : 'secondary'}>
                  {consultationId ? 'Concluído' : 'Pendente'}
                </Badge>
                {currentStep === 'finalization' && (
                  <Button onClick={handleFinalizeConsultation} size="sm">
                    Finalizar Consulta
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {isReady && nutritionState.result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Resultados do Cálculo</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-600">TMB:</span> {nutritionState.result.bmr} kcal
                </div>
                <div>
                  <span className="text-green-600">GET:</span> {nutritionState.result.get} kcal
                </div>
                <div>
                  <span className="text-green-600">VET:</span> {nutritionState.result.vet} kcal
                </div>
                <div>
                  <span className="text-green-600">Proteína:</span> {nutritionState.result.targets.protein}g
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {hasError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Erro no Processo</h4>
              <p className="text-red-700 text-sm">{nutritionState.error}</p>
            </div>
          )}

          {/* Completion Actions */}
          {currentStep === 'completed' && (
            <div className="mt-6 flex gap-2">
              <Button onClick={() => navigate(`/patient-history/${patientId}`)}>
                Ver Histórico do Paciente
              </Button>
              <Button variant="outline" onClick={() => navigate('/patients')}>
                Voltar aos Pacientes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default E2EAttendanceFlow;
