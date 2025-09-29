import { useOfficialCalculations } from '@/hooks/useOfficialCalculations';
import OfficialCalculatorForm from '@/components/calculator/official/OfficialCalculatorForm';
import CalculatorResults from '@/components/calculator/results/CalculatorResults';
import { Button } from '@/components/ui/button';
import { useUnifiedNutrition } from '@/contexts/UnifiedNutritionContext';
import { OfficialCalculatorFormData } from '@/hooks/useOfficialCalculations';
import { useClinicalWorkflow } from '@/contexts/ClinicalWorkflowContext';
import { useEffect } from 'react';

interface NutritionalEvaluationStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Representa a etapa de avaliação nutricional dentro do fluxo clínico unificado.
 * Utiliza o hook da calculadora oficial e se integra com o UnifiedNutritionContext.
 */
export default function NutritionalEvaluationStep({
  onNext,
  onBack,
}: NutritionalEvaluationStepProps) {
  // Hook da calculadora para gerenciar o formulário e os cálculos
  const {
    form,
    runCalculation,
    calculationResult,
    error,
    resetCalculator,
    availableFormulas,
    loadPatientData,
  } = useOfficialCalculations();

  // Hook do workflow para obter dados da sessão e do paciente
  const { activeSession } = useClinicalWorkflow();

  // Hook do nosso novo contexto unificado para salvar o estado
  const { setNutritionalCalculations, saveWorkflowStateToSupabase } =
    useUnifiedNutrition();

  // Carrega os dados do paciente no formulário quando a etapa é iniciada
  useEffect(() => {
    if (activeSession?.patient) {
      loadPatientData(activeSession.patient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.patient]);


  // Função chamada quando o formulário da calculadora é submetido
  const handleCalculate = (data: OfficialCalculatorFormData) => {
    const result = runCalculation(data); // Executa o cálculo
    if (result) {
      setNutritionalCalculations(result); // Salva o resultado no estado do contexto unificado
    }
  };

  // Função para salvar os resultados no Supabase e avançar para a próxima etapa
  const handleSaveChangesAndContinue = async () => {
    await saveWorkflowStateToSupabase(); // Salva o estado (incluindo os cálculos) no Supabase
    onNext(); // Avança para a próxima etapa do workflow
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Coluna do Formulário */}
      <div className="w-full">
        <OfficialCalculatorForm
          form={form}
          onSubmit={handleCalculate}
          availableFormulas={availableFormulas}
          isLoading={form.formState.isSubmitting}
        />
      </div>

      {/* Coluna dos Resultados */}
      <div className="w-full">
        <CalculatorResults
          result={calculationResult}
          error={error}
          onReset={resetCalculator}
          onSave={handleSaveChangesAndContinue} // Botão de salvar agora avança o fluxo
          // Desabilitamos a geração de plano direto daqui para seguir o fluxo
          onGeneratePlan={() => {}}
          isSaveAndContinue={true} // Modifica o texto do botão para "Salvar e Continuar"
        />
        <Button variant="outline" onClick={onBack} className="mt-4 w-full">
          Voltar para Seleção de Paciente
        </Button>
      </div>
    </div>
  );
}
