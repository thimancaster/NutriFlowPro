
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, FileText, Users } from 'lucide-react';
import WorkflowProgress from './WorkflowProgress';
import MealPlanGenerationStep from './MealPlanGenerationStep';
import MealPlanEditingStep from './MealPlanEditingStep';

const MealPlanWorkflow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { activePatient } = usePatient();
  const {
    patient,
    calculationData,
    currentMealPlan,
    currentStep,
    setPatient,
    setCalculationData,
    setCurrentStep,
    generateMealPlan,
    saveMealPlan,
    resetWorkflow
  } = useMealPlanWorkflow();

  // Initialize workflow with data from navigation state
  useEffect(() => {
    const state = location.state;
    console.log('Workflow state received:', state);
    
    if (state) {
      // Set patient data
      if (state.patientData && !patient) {
        console.log('Setting patient from state:', state.patientData);
        setPatient(state.patientData);
      }
      
      // Set calculation data
      if (state.calculationData && !calculationData) {
        console.log('Setting calculation data from state:', state.calculationData);
        setCalculationData(state.calculationData);
        setCurrentStep('generation');
      }
    }
  }, [location.state, patient, calculationData, setPatient, setCalculationData, setCurrentStep]);

  // Initialize with active patient if available
  useEffect(() => {
    if (activePatient && !patient) {
      setPatient(activePatient);
    }
  }, [activePatient, patient, setPatient]);

  const handleSelectPatient = () => {
    navigate('/patients');
  };

  const handleCalculateNutrition = () => {
    if (patient) {
      navigate(`/calculator?patientId=${patient.id}`);
    } else {
      navigate('/calculator');
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!user || !patient || !calculationData) {
      console.error('Missing required data for meal plan generation');
      return;
    }
    
    console.log('Generating meal plan with data:', { patient, calculationData });
    await generateMealPlan(calculationData);
  };

  const handleBackToCalculator = () => {
    if (patient) {
      navigate(`/calculator?patientId=${patient.id}`);
    } else {
      navigate('/calculator');
    }
  };

  const handleStartOver = () => {
    resetWorkflow();
    setCurrentStep('patient');
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Você precisa estar logado para acessar o gerador de planos alimentares.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/meal-plans')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gerador de Plano Alimentar</h1>
            <p className="text-gray-600">
              {patient ? `Paciente: ${patient.name}` : 'Selecione um paciente para começar'}
            </p>
          </div>
        </div>
        
        {currentStep !== 'patient' && (
          <Button variant="outline" onClick={handleStartOver}>
            Recomeçar
          </Button>
        )}
      </div>

      <WorkflowProgress currentStep={currentStep} />

      {/* Step 1: Patient Selection and Calculation */}
      {currentStep === 'patient' && (
        <div className="space-y-6">
          {!patient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Selecionar Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Primeiro, selecione um paciente para gerar o plano alimentar.
                </p>
                <Button onClick={handleSelectPatient}>
                  <Users className="h-4 w-4 mr-2" />
                  Selecionar Paciente
                </Button>
              </CardContent>
            </Card>
          )}

          {patient && !calculationData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calcular Necessidades Nutricionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Paciente: {patient.name}</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Agora precisamos calcular as necessidades nutricionais deste paciente.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCalculateNutrition}>
                      <Calculator className="h-4 w-4 mr-2" />
                      Ir para Calculadora
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Skip calculation with mock data for demo
                        const mockData = {
                          id: 'mock',
                          totalCalories: 2000,
                          protein: 150,
                          carbs: 200,
                          fats: 67
                        };
                        setCalculationData(mockData);
                        setCurrentStep('generation');
                      }}
                    >
                      Usar Valores Padrão (Demo)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {patient && calculationData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pronto para Gerar Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900">Dados Disponíveis:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-green-700">Calorias:</span>
                        <div className="font-bold">{calculationData.totalCalories}</div>
                      </div>
                      <div>
                        <span className="text-green-700">Proteína:</span>
                        <div className="font-bold">{calculationData.protein}g</div>
                      </div>
                      <div>
                        <span className="text-green-700">Carboidratos:</span>
                        <div className="font-bold">{calculationData.carbs}g</div>
                      </div>
                      <div>
                        <span className="text-green-700">Gorduras:</span>
                        <div className="font-bold">{calculationData.fats}g</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => setCurrentStep('generation')}>
                      Gerar Plano Alimentar
                    </Button>
                    <Button variant="outline" onClick={handleBackToCalculator}>
                      Recalcular
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Meal Plan Generation */}
      {currentStep === 'generation' && (
        <MealPlanGenerationStep
          patient={patient}
          calculationData={calculationData}
          onGenerate={handleGenerateMealPlan}
          onBack={() => setCurrentStep('patient')}
        />
      )}

      {/* Step 3: Meal Plan Editing */}
      {currentStep === 'mealPlan' && currentMealPlan && (
        <MealPlanEditingStep
          mealPlan={currentMealPlan}
          onSave={saveMealPlan}
          onBack={() => setCurrentStep('generation')}
        />
      )}

      {/* Step 4: Completed */}
      {currentStep === 'completed' && currentMealPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <FileText className="h-5 w-5" />
              Plano Alimentar Finalizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Plano salvo com sucesso!</h3>
                <p className="text-green-700 text-sm mt-1">
                  O plano alimentar foi salvo e está disponível na lista de planos do paciente.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => navigate('/meal-plans')}>
                  Ver Todos os Planos
                </Button>
                <Button variant="outline" onClick={handleStartOver}>
                  Criar Novo Plano
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanWorkflow;
