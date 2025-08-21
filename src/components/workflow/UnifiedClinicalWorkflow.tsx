import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, User, Calculator, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import PatientForm from '@/components/patient/PatientForm';
import { Patient } from '@/types';

export interface UnifiedClinicalWorkflowProps {
  onComplete?: () => void;
}

type WorkflowStep = 'patient' | 'calculation' | 'mealPlan';

const UnifiedClinicalWorkflow: React.FC<UnifiedClinicalWorkflowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('patient');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [nutritionalResults, setNutritionalResults] = useState<any>(null);
  
  const { user } = useAuth();
  const { savePatient } = usePatient();

  const handlePatientComplete = async (patientData: any) => {
    try {
      let patient: Patient;
      
      if (patientData.id) {
        // Existing patient
        patient = patientData as Patient;
      } else {
        // New patient
        const result = await savePatient({
          ...patientData,
          user_id: user?.id
        });
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Erro ao salvar paciente');
        }
        
        patient = result.data;
      }
      
      setSelectedPatient(patient);
      setCurrentStep('calculation');
    } catch (error) {
      console.error('Erro ao processar paciente:', error);
    }
  };

  const handleCalculationComplete = (results: any) => {
    setNutritionalResults(results);
    setCurrentStep('mealPlan');
  };

  const handleBack = () => {
    if (currentStep === 'calculation') {
      setCurrentStep('patient');
    } else if (currentStep === 'mealPlan') {
      setCurrentStep('calculation');
    }
  };

  const handleWorkflowComplete = () => {
    onComplete?.();
  };

  const getStepIcon = (step: WorkflowStep) => {
    switch (step) {
      case 'patient':
        return <User className="h-4 w-4" />;
      case 'calculation':
        return <Calculator className="h-4 w-4" />;
      case 'mealPlan':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStepTitle = (step: WorkflowStep) => {
    switch (step) {
      case 'patient':
        return 'Dados do Paciente';
      case 'calculation':
        return 'Cálculos Nutricionais';
      case 'mealPlan':
        return 'Plano Alimentar';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {(['patient', 'calculation', 'mealPlan'] as WorkflowStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === step 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {getStepIcon(step)}
              </div>
              {index < 2 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  (['calculation', 'mealPlan'] as WorkflowStep[]).includes(currentStep) && index === 0
                    ? 'bg-blue-500' 
                    : currentStep === 'mealPlan' && index === 1
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          {(['patient', 'calculation', 'mealPlan'] as WorkflowStep[]).map((step) => (
            <div key={step} className="text-sm font-medium text-center w-32">
              {getStepTitle(step)}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStepIcon(currentStep)}
            {getStepTitle(currentStep)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 'patient' && (
            <PatientForm onSubmit={handlePatientComplete} />
          )}

          {currentStep === 'calculation' && selectedPatient && (
            <div className="text-center py-8">
              <p className="mb-4">Funcionalidade de cálculos será implementada em breve</p>
              <Button onClick={() => handleCalculationComplete({ 
                totalCalories: 2000, 
                protein: 120, 
                carbs: 250, 
                fats: 67,
                objective: 'manutenção' 
              })}>
                Continuar com valores exemplo
              </Button>
            </div>
          )}

          {currentStep === 'mealPlan' && nutritionalResults && (
            <div className="text-center py-8">
              <p className="mb-4">Geração de plano alimentar será implementada em breve</p>
              <Button onClick={handleWorkflowComplete}>
                Finalizar Consulta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 'patient'}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {currentStep === 'mealPlan' && (
          <Button onClick={handleWorkflowComplete}>
            Finalizar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default UnifiedClinicalWorkflow;
