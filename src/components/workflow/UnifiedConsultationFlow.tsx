
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Calculator, Utensils, FileText, User, TrendingUp, CheckCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ConsolidatedPatientSelector from './ConsolidatedPatientSelector';
import ConsolidatedCalculationPanel from './ConsolidatedCalculationPanel';
import { useConsolidatedMealPlan } from '@/hooks/useConsolidatedMealPlan';
import { Patient } from '@/types';
import { patientEvolutionService, CreateEvolutionMetrics } from '@/services/patientEvolutionService';
import { useAuth } from '@/contexts/auth/AuthContext';

type WorkflowStep = 'patient' | 'calculation' | 'meal-plan' | 'evolution';

const steps = [
  { id: 'patient', label: 'Paciente', icon: User, description: 'Selecionar paciente' },
  { id: 'calculation', label: 'Cálculo', icon: Calculator, description: 'Cálculo nutricional' },
  { id: 'meal-plan', label: 'Plano Alimentar', icon: Utensils, description: 'Gerar e editar plano' },
  { id: 'evolution', label: 'Evolução', icon: TrendingUp, description: 'Histórico e progresso' }
];

const UnifiedConsultationFlow: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State management
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('patient');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [calculationResults, setCalculationResults] = useState<any>(null);
  const [workflowData, setWorkflowData] = useState({
    patient: null as Patient | null,
    calculation: null as any,
    mealPlan: null as any,
    consultation: null as any
  });

  const {
    generateMealPlan,
    isGenerating,
    currentMealPlan
  } = useConsolidatedMealPlan();

  // Calculate progress
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = (currentStepIndex / (steps.length - 1)) * 100;

  // Auto-advance logic
  useEffect(() => {
    if (selectedPatient && currentStep === 'patient') {
      setCurrentStep('calculation');
    }
  }, [selectedPatient, currentStep]);

  useEffect(() => {
    if (calculationResults && currentStep === 'calculation') {
      // Auto-generate meal plan when calculation is complete
      handleGenerateMealPlan();
    }
  }, [calculationResults, currentStep]);

  const handlePatientSelected = (patient: Patient) => {
    setSelectedPatient(patient);
    setWorkflowData(prev => ({ ...prev, patient }));
  };

  const handleCalculationComplete = async (results: any) => {
    setCalculationResults(results);
    setWorkflowData(prev => ({ ...prev, calculation: results }));

    // FASE 3 - Salvar métricas de evolução automaticamente
    if (selectedPatient && user?.id) {
      try {
        const metricsData: CreateEvolutionMetrics = {
          patient_id: selectedPatient.id,
          user_id: user.id,
          weight: results.weight || 0,
          height: results.height,
          bmi: results.bmi,
          vet: results.vet || results.get,
          tmb: results.bmr,
          get_value: results.get,
          protein_target_g: results.macros?.protein?.grams,
          carbs_target_g: results.macros?.carbs?.grams,
          fat_target_g: results.macros?.fat?.grams,
          measurement_date: new Date().toISOString().split('T')[0],
        };

        console.log('💾 Salvando métricas de evolução...', metricsData);
        await patientEvolutionService.saveMetrics(metricsData);
        console.log('✅ Métricas de evolução salvas com sucesso');
      } catch (error) {
        console.error('❌ Erro ao salvar métricas de evolução:', error);
        // Não bloqueia o fluxo se houver erro nas métricas
      }
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!selectedPatient || !calculationResults) {
      toast({
        title: 'Dados Insuficientes',
        description: 'Selecione um paciente e complete o cálculo nutricional',
        variant: 'destructive'
      });
      return;
    }

    try {
      const mealPlan = await generateMealPlan(
        calculationResults.vet || calculationResults.get,
        calculationResults.macros.protein.grams,
        calculationResults.macros.carbs.grams,
        calculationResults.macros.fat.grams,
        selectedPatient.id
      );

      if (mealPlan) {
        setWorkflowData(prev => ({ ...prev, mealPlan }));
        setCurrentStep('meal-plan');
      }
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
    }
  };

  const handleStepChange = (step: WorkflowStep) => {
    const stepIndex = steps.findIndex(s => s.id === step);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    // Allow backward navigation or if requirements are met
    if (stepIndex <= currentIndex || canAccessStep(step)) {
      setCurrentStep(step);
    }
  };

  const canAccessStep = (step: WorkflowStep): boolean => {
    switch (step) {
      case 'patient':
        return true;
      case 'calculation':
        return !!selectedPatient;
      case 'meal-plan':
        return !!selectedPatient && !!calculationResults;
      case 'evolution':
        return !!selectedPatient;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (canAccessStep(nextStep.id as WorkflowStep)) {
        setCurrentStep(nextStep.id as WorkflowStep);
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as WorkflowStep);
    }
  };

  const handleCompleteWorkflow = async () => {
    // TODO: Save consultation record
    toast({
      title: 'Consulta Finalizada',
      description: 'Atendimento registrado com sucesso!',
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Atendimento Nutricional Unificado
            </div>
            {selectedPatient && (
              <Badge variant="default" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {selectedPatient.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do Atendimento</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Navigation */}
            <Tabs value={currentStep} onValueChange={(value) => handleStepChange(value as WorkflowStep)}>
              <TabsList className="grid w-full grid-cols-4">
                {steps.map((step) => {
                  const isAccessible = canAccessStep(step.id as WorkflowStep);
                  const isCompleted = steps.findIndex(s => s.id === step.id) < currentStepIndex;
                  
                  return (
                    <TabsTrigger
                      key={step.id}
                      value={step.id}
                      disabled={!isAccessible}
                      className={`flex items-center gap-2 ${
                        isCompleted ? 'text-green-600' : ''
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">{step.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Step Content */}
              <TabsContent value="patient" className="mt-6">
                <ConsolidatedPatientSelector
                  onPatientSelected={handlePatientSelected}
                  preSelectedPatientId={patientId}
                />
              </TabsContent>

              <TabsContent value="calculation" className="mt-6">
                {selectedPatient ? (
                  <ConsolidatedCalculationPanel
                    patient={selectedPatient}
                    onCalculationComplete={handleCalculationComplete}
                    autoCalculate={true}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Selecione um paciente primeiro</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="meal-plan" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      Editor de Plano Alimentar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isGenerating ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Gerando plano alimentar inteligente...</p>
                      </div>
                    ) : currentMealPlan ? (
                      <div className="space-y-4">
                        <div className="bg-accent/50 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Plano Alimentar Gerado</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-lg font-bold">{Math.round(currentMealPlan.total_calories)}</p>
                              <p className="text-sm text-muted-foreground">kcal totais</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">{Math.round(currentMealPlan.total_protein)}g</p>
                              <p className="text-sm text-muted-foreground">Proteína</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">{Math.round(currentMealPlan.total_carbs)}g</p>
                              <p className="text-sm text-muted-foreground">Carboidratos</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">{Math.round(currentMealPlan.total_fats)}g</p>
                              <p className="text-sm text-muted-foreground">Gorduras</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">Plano alimentar com {currentMealPlan.meals?.length || 0} refeições</p>
                          <Button onClick={() => setCurrentStep('evolution')}>
                            Continuar para Evolução
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">Complete o cálculo nutricional para gerar o plano</p>
                        <Button 
                          onClick={handleGenerateMealPlan}
                          disabled={!calculationResults}
                        >
                          Gerar Plano Alimentar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evolution" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Evolução do Paciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">Gráfico evolutivo será implementado aqui</p>
                      <p className="text-sm text-muted-foreground">Mostrará peso, IMC e evolução por consulta</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Etapa {currentStepIndex + 1} de {steps.length}
          </p>
        </div>

        {currentStep === 'evolution' ? (
          <Button onClick={handleCompleteWorkflow}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalizar Consulta
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1 || !canAccessStep(steps[currentStepIndex + 1]?.id as WorkflowStep)}
          >
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default UnifiedConsultationFlow;
