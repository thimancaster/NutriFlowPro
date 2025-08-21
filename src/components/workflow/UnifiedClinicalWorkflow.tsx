import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PatientForm } from '@/components/patient/PatientForm';
import { CalculatorForm } from '@/components/calculator/components';
import { MealPlanGenerationStep } from './steps/MealPlanGenerationStep';
import { Patient } from '@/types';

interface UnifiedClinicalWorkflowProps {
  onComplete: () => void;
}

type WorkflowStep = 'patient' | 'nutritional' | 'mealPlan' | 'completed';

export const UnifiedClinicalWorkflow: React.FC<UnifiedClinicalWorkflowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('patient');
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [calculationResults, setCalculationResults] = useState<{
    totalCalories: number;
    protein: number;
    carbs: number;
    fats: number;
    objective: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { createPatient, updatePatient, activePatient } = usePatient();
  const { user } = useAuth();

  const handlePatientSubmit = useCallback(async (data: Patient) => {
    setIsLoading(true);
    try {
      if (activePatient) {
        await updatePatient({ id: activePatient.id, ...data });
        setPatientData({ ...activePatient, ...data });
      } else {
        const newPatient = await createPatient(data);
        setPatientData(newPatient);
      }
      setCurrentStep('nutritional');
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
    } finally {
      setIsLoading(false);
    }
  }, [createPatient, updatePatient, activePatient]);

  const handleCalculationComplete = useCallback((results: {
    totalCalories: number;
    protein: number;
    carbs: number;
    fats: number;
    objective: string;
  }) => {
    setCalculationResults(results);
    setCurrentStep('mealPlan');
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'patient':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 1: Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <PatientForm onSubmit={handlePatientSubmit} initialValues={activePatient || undefined} />
              )}
            </CardContent>
          </Card>
        );
      case 'nutritional':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 2: Cálculos Nutricionais</CardTitle>
            </CardHeader>
            <CardContent>
              <CalculatorForm
                patient={activePatient}
                onComplete={handleCalculationComplete}
                onBack={() => setCurrentStep('patient')}
              />
            </CardContent>
          </Card>
        );
      case 'mealPlan':
        return (
          <MealPlanGenerationStep
            patientData={patientData}
            calculationResults={calculationResults}
            onBack={() => setCurrentStep('nutritional')}
            onComplete={() => setCurrentStep('completed')}
          />
        );
      case 'completed':
        return (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-center mb-4">Atendimento Concluído!</h2>
              <p className="text-gray-600 text-center mb-4">
                Obrigado por utilizar nosso sistema. O plano alimentar foi gerado e está pronto para ser compartilhado com o paciente.
              </p>
              <Button onClick={onComplete}>
                Finalizar
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return <div>Etapa inválida</div>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      {renderStepContent()}
    </div>
  );
};
