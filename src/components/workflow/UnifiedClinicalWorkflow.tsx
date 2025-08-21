
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, User, Calculator, FileText, Utensils, CheckCircle } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { PatientSelectionStep } from './steps/PatientSelectionStep';
import { AnthropometryStep } from './steps/AnthropometryStep';
import { NutritionalCalculationStep } from './steps/NutritionalCalculationStep';
import { MealPlanGenerationStep } from './steps/MealPlanGenerationStep';

export type UnifiedWorkflowStep = 
  | 'patient-selection'
  | 'anthropometry' 
  | 'nutritional-calculation'
  | 'meal-plan-generation'
  | 'consultation-review';

interface UnifiedClinicalWorkflowProps {
  onWorkflowComplete?: () => void;
}

/**
 * FLUXO UNIFICADO DE ATENDIMENTO NUTRICIONAL
 * 
 * Este é o fluxo padrão consolidado que integra:
 * - Seleção de paciente
 * - Coleta antropométrica  
 * - Cálculos nutricionais (100% fiel à planilha)
 * - Geração de plano alimentar
 * - Revisão e finalização
 */
const UnifiedClinicalWorkflow: React.FC<UnifiedClinicalWorkflowProps> = ({
  onWorkflowComplete
}) => {
  const { 
    consultationData,
    currentStep,
    setCurrentStep,
    isConsultationActive
  } = useConsultationData();
  
  const { activePatient } = usePatient();
  
  const [completedSteps, setCompletedSteps] = useState<UnifiedWorkflowStep[]>([]);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<UnifiedWorkflowStep>('patient-selection');

  const workflowSteps: Array<{
    id: UnifiedWorkflowStep;
    title: string;
    icon: React.ReactNode;
    description: string;
    requiredData: string[];
  }> = [
    {
      id: 'patient-selection',
      title: 'Seleção do Paciente',
      icon: <User className="h-5 w-5" />,
      description: 'Escolher paciente para atendimento',
      requiredData: ['activePatient']
    },
    {
      id: 'anthropometry',
      title: 'Dados Antropométricos',
      icon: <FileText className="h-5 w-5" />,
      description: 'Peso, altura, idade e medidas corporais',
      requiredData: ['weight', 'height', 'age', 'gender']
    },
    {
      id: 'nutritional-calculation',
      title: 'Cálculos Nutricionais',
      icon: <Calculator className="h-5 w-5" />,
      description: 'TMB, GET, VET e distribuição de macros',
      requiredData: ['tmb', 'get', 'macros']
    },
    {
      id: 'meal-plan-generation',
      title: 'Plano Alimentar',
      icon: <Utensils className="h-5 w-5" />,
      description: 'Geração do cardápio personalizado',
      requiredData: ['mealPlan']
    },
    {
      id: 'consultation-review',
      title: 'Revisão Final',
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Validação e finalização da consulta',
      requiredData: ['consultation']
    }
  ];

  // Atualizar etapas concluídas baseado nos dados disponíveis
  useEffect(() => {
    const newCompletedSteps: UnifiedWorkflowStep[] = [];
    
    if (activePatient) {
      newCompletedSteps.push('patient-selection');
    }
    
    if (activePatient && consultationData?.weight && consultationData?.height && consultationData?.age) {
      newCompletedSteps.push('anthropometry');
    }
    
    if (consultationData?.results && consultationData.results.vet > 0) {
      newCompletedSteps.push('nutritional-calculation');
    }
    
    setCompletedSteps(newCompletedSteps);
    
    // Auto-advance to next incomplete step
    const nextStep = workflowSteps.find(step => 
      !newCompletedSteps.includes(step.id)
    );
    
    if (nextStep && nextStep.id !== currentWorkflowStep) {
      setCurrentWorkflowStep(nextStep.id);
    }
  }, [activePatient, consultationData, currentWorkflowStep]);

  const handleStepClick = (stepId: UnifiedWorkflowStep) => {
    const stepIndex = workflowSteps.findIndex(s => s.id === stepId);
    const currentIndex = workflowSteps.findIndex(s => s.id === currentWorkflowStep);
    
    // Permitir navegar apenas para etapas anteriores ou próxima etapa disponível
    if (stepIndex <= currentIndex + 1) {
      setCurrentWorkflowStep(stepId);
    }
  };

  const handleStepComplete = (stepId: UnifiedWorkflowStep) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
    
    // Auto-advance para próxima etapa
    const currentIndex = workflowSteps.findIndex(s => s.id === stepId);
    const nextStep = workflowSteps[currentIndex + 1];
    
    if (nextStep) {
      setCurrentWorkflowStep(nextStep.id);
    } else {
      // Workflow completo
      onWorkflowComplete?.();
    }
  };

  const renderStepContent = () => {
    switch (currentWorkflowStep) {
      case 'patient-selection':
        return (
          <PatientSelectionStep 
            onPatientSelected={() => handleStepComplete('patient-selection')} 
          />
        );
        
      case 'anthropometry':
        return (
          <AnthropometryStep 
            onDataComplete={() => handleStepComplete('anthropometry')} 
          />
        );
        
      case 'nutritional-calculation':
        return (
          <NutritionalCalculationStep 
            onCalculationComplete={() => handleStepComplete('nutritional-calculation')} 
          />
        );
        
      case 'meal-plan-generation':
        return (
          <MealPlanGenerationStep 
            onMealPlanComplete={() => handleStepComplete('meal-plan-generation')} 
          />
        );
        
      case 'consultation-review':
        return (
          <div className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Consulta Finalizada</h3>
            <p className="text-muted-foreground">
              Todos os dados foram coletados e o plano nutricional foi gerado com sucesso.
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getStepStatus = (stepId: UnifiedWorkflowStep) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentWorkflowStep) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Fluxo de Atendimento Nutricional Consolidado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <Button
                      variant={status === 'current' ? 'default' : 'outline'}
                      size="sm"
                      className={`w-12 h-12 rounded-full p-0 ${
                        status === 'completed' 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : status === 'current'
                            ? 'bg-primary text-white' 
                            : 'bg-muted'
                      }`}
                      onClick={() => handleStepClick(step.id)}
                      disabled={status === 'pending' && step.id !== currentWorkflowStep}
                    >
                      {status === 'completed' ? <CheckCircle className="h-5 w-5" /> : step.icon}
                    </Button>
                    <div className="text-center mt-2 max-w-[120px]">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                      <Badge 
                        variant={status === 'completed' ? 'default' : 'secondary'} 
                        className="mt-1 text-xs"
                      >
                        {status === 'completed' ? 'Concluído' : 
                         status === 'current' ? 'Atual' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground mx-2" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Patient Status */}
      {activePatient && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Paciente: {activePatient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {activePatient.age && `${activePatient.age} anos`} • 
                  {activePatient.gender === 'male' ? ' Masculino' : ' Feminino'}
                </p>
              </div>
              <Badge variant="default" className="bg-primary">
                Em Atendimento
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedClinicalWorkflow;
