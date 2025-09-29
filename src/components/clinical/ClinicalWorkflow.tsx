import { useEffect } from 'react';
import { useClinicalWorkflow } from '@/contexts/ClinicalWorkflowContext';
import {
  UnifiedNutritionProvider,
  useUnifiedNutrition,
} from '@/contexts/UnifiedNutritionContext';
import PatientSelectionStep from './steps/PatientSelectionStep';
import NutritionalEvaluationStep from './steps/NutritionalCalculationStep';
import MealPlanGenerationStep from './steps-v2/MealPlanGenerationStep';
import WorkflowHeader from './WorkflowHeader';

// Componente Interno que opera dentro dos contextos
const WorkflowSteps = () => {
  const { activeSession, currentStep, goToNextStep, goToPreviousStep } =
    useClinicalWorkflow();
  const { loadWorkflowStateFromSupabase } = useUnifiedNutrition();

  // Carrega os dados da sessão do Supabase sempre que uma sessão ativa mudar
  useEffect(() => {
    if (activeSession) {
      loadWorkflowStateFromSupabase();
    }
  }, [activeSession, loadWorkflowStateFromSupabase]);

  if (!activeSession) {
    return <PatientSelectionStep onPatientSelect={goToNextStep} />;
  }

  return (
    <div className="space-y-8">
      <WorkflowHeader
        patientName={activeSession.patient?.name || 'Paciente'}
        currentStep={currentStep}
      />
      {currentStep === 1 && (
        <NutritionalEvaluationStep
          onNext={goToNextStep}
          onBack={() => goToPreviousStep()}
        />
      )}
      {currentStep === 2 && (
        <MealPlanGenerationStep
          onBack={goToPreviousStep}
          // onComplete será a próxima etapa
        />
      )}
      {/* Outras etapas do fluxo serão adicionadas aqui */}
    </div>
  );
};

/**
 * Componente principal que envolve todo o fluxo clínico com os provedores de contexto necessários.
 */
export default function ClinicalWorkflow() {
  return (
    <UnifiedNutritionProvider>
      <WorkflowSteps />
    </UnifiedNutritionProvider>
  );
}
