
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Calculator, Utensils, CheckCircle } from 'lucide-react';
import MealPlanGenerationStep from './MealPlanGenerationStep';
import MealPlanEditingStep from './MealPlanEditingStep';
import WorkflowProgress from './WorkflowProgress';

const MealPlanWorkflow: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const {
    patient,
    calculationData,
    currentStep,
    setPatient,
    setCalculationData,
    setCurrentStep
  } = useMealPlanWorkflow();

  // Handle data from calculation/ENP system
  useEffect(() => {
    const locationState = location.state;
    if (locationState) {
      if (locationState.patientData) {
        setPatient(locationState.patientData);
      }
      if (locationState.calculationData) {
        setCalculationData(locationState.calculationData);
        setCurrentStep('generation');
      }
    }
  }, [location.state, setPatient, setCalculationData, setCurrentStep]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-gray-600">Faça login para acessar o gerador de planos alimentares.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient || !calculationData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados Necessários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Para gerar um plano alimentar, é necessário:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Paciente selecionado</li>
              <li>Cálculo nutricional realizado</li>
            </ul>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Acesse a calculadora ENP, realize o cálculo e clique em "Gerar Plano Alimentar"
                para ser direcionado automaticamente para este fluxo.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Utensils className="h-8 w-8 text-green-600" />
          Gerador de Plano Alimentar
        </h1>
        <p className="text-gray-600">
          Paciente: <strong>{patient.name}</strong> | 
          Meta: <strong>{calculationData.totalCalories || 'N/A'} kcal</strong>
        </p>
      </div>

      {/* Progress Indicator */}
      <WorkflowProgress currentStep={currentStep} />

      {/* Main Content */}
      <div className="space-y-6">
        {currentStep === 'generation' && (
          <MealPlanGenerationStep />
        )}
        
        {currentStep === 'editing' && (
          <MealPlanEditingStep />
        )}
        
        {currentStep === 'completed' && (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-xl font-semibold mb-2">Plano Alimentar Concluído</h2>
              <p className="text-gray-600 mb-4">
                O plano alimentar foi salvo com sucesso e está disponível no histórico do paciente.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MealPlanWorkflow;
