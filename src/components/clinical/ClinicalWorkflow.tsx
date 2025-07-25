import React, { useState, useCallback } from 'react';
import PatientSelectionStep from './PatientSelectionStep';
import PatientInfoStep from './PatientInfoStep';
import AnthropometryStep from './AnthropometryStep';
import NutritionalEvaluationStep from './NutritionalEvaluationStep';
import MealPlanStep from './MealPlanStep';
import RecommendationsStep from './RecommendationsStep';
import FollowUpStep from './FollowUpStep';
import { Patient } from '@/types';
import { ConsultationData } from '@/types/consultation';

interface ClinicalWorkflowProps {
  // Add any props that the ClinicalWorkflow component might receive
}

const ClinicalWorkflow: React.FC<ClinicalWorkflowProps> = () => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<ConsultationData | null>(null);
  const [currentStep, setCurrentStep] = useState<'patient-selection' | 'patient-info' | 'anthropometry' | 'nutritional-evaluation' | 'meal-plan' | 'recommendations' | 'follow-up'>('patient-selection');

  const handlePatientSelected = useCallback((patient: Patient) => {
    setActivePatient(patient);
    setCurrentStep('patient-info');
  }, []);

  const handleCreateNewPatient = useCallback(() => {
    // Logic to create a new patient
    console.log('Creating new patient');
  }, []);

  const handleNextStep = useCallback(() => {
    switch (currentStep) {
      case 'patient-info':
        setCurrentStep('anthropometry');
        break;
      case 'anthropometry':
        setCurrentStep('nutritional-evaluation');
        break;
      case 'nutritional-evaluation':
        setCurrentStep('meal-plan');
        break;
      case 'meal-plan':
        setCurrentStep('recommendations');
        break;
      case 'recommendations':
        setCurrentStep('follow-up');
        break;
      default:
        break;
    }
  }, [currentStep]);

  const handlePreviousStep = useCallback(() => {
    switch (currentStep) {
      case 'patient-info':
        setCurrentStep('patient-selection');
        break;
      case 'anthropometry':
        setCurrentStep('patient-info');
        break;
      case 'nutritional-evaluation':
        setCurrentStep('anthropometry');
        break;
      case 'meal-plan':
        setCurrentStep('nutritional-evaluation');
        break;
      case 'recommendations':
        setCurrentStep('meal-plan');
        break;
      case 'follow-up':
        setCurrentStep('recommendations');
        break;
      default:
        break;
    }
  }, [currentStep]);

  const handleUpdatePatient = useCallback((patientData: Partial<Patient>) => {
    // Logic to update patient data
    console.log('Updating patient data:', patientData);
  }, []);

  const handleAnthropometryDataSaved = useCallback((data: any) => {
    // Logic to save anthropometry data
    console.log('Saving anthropometry data:', data);
  }, []);

  const handleConsultationDataChange = useCallback((data: Partial<ConsultationData>) => {
    setActiveConsultation(prev => ({ ...prev, ...data }) as ConsultationData);
  }, []);

  const handleMealPlanSaved = useCallback((mealPlanData: any) => {
    // Logic to save meal plan data
    console.log('Saving meal plan data:', mealPlanData);
  }, []);

  const handleRecommendationsSaved = useCallback((recommendationsData: any) => {
    // Logic to save recommendations data
    console.log('Saving recommendations data:', recommendationsData);
  }, []);

  const handleCompleteWorkflow = useCallback(() => {
    // Logic to complete the workflow
    console.log('Completing workflow');
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'patient-selection':
        return (
          <PatientSelectionStep
            onPatientSelected={handlePatientSelected}
            onCreateNew={handleCreateNewPatient}
          />
        );
      case 'patient-info':
        return (
          <PatientInfoStep
            patient={activePatient}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            onUpdatePatient={handleUpdatePatient}
          />
        );
      case 'anthropometry':
        return (
          <AnthropometryStep
            patient={activePatient}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            onDataSaved={handleAnthropometryDataSaved}
          />
        );
      case 'nutritional-evaluation':
        return (
          <NutritionalEvaluationStep
            data={{
              activityLevel: 'moderate',
              bodyType: 'normal',
              tmb: 0,
              get: 0,
              vet: 0,
              calories: 0,
              protein: 0,
              carbs: 0
            }}
            onDataChange={handleConsultationDataChange}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 'meal-plan':
        return (
          <MealPlanStep
            patient={activePatient}
            consultation={activeConsultation}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            onMealPlanSaved={handleMealPlanSaved}
          />
        );
      case 'recommendations':
        return (
          <RecommendationsStep
            patient={activePatient}
            consultation={activeConsultation}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            onSaved={handleRecommendationsSaved}
          />
        );
      case 'follow-up':
        return (
          <FollowUpStep
            patient={activePatient}
            consultation={activeConsultation}
            onComplete={handleCompleteWorkflow}
            onPrevious={handlePreviousStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Clinical Workflow</h2>
      <div>
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default ClinicalWorkflow;
