import { useUnifiedNutrition } from '@/contexts/UnifiedNutritionContext';
import MealPlanGenerator from '@/components/meal-plan/MealPlanGenerator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useClinicalWorkflow } from '@/contexts/ClinicalWorkflowContext';

/**
 * Representa a etapa de geração do plano alimentar dentro do fluxo unificado.
 * Ela busca os resultados do cálculo do UnifiedNutritionContext e os passa para o gerador de planos.
 */
export default function MealPlanGenerationStep() {
  const { goToPreviousStep } = useClinicalWorkflow();
  const {
    nutritionalCalculations,
    mealPlan,
    setMealPlan,
    saveWorkflowStateToSupabase,
  } = useUnifiedNutrition();

  if (!nutritionalCalculations) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-secondary/50 rounded-lg border-2 border-dashed border-secondary">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Dados Insuficientes</AlertTitle>
          <AlertDescription>
            Os resultados do cálculo nutricional não foram encontrados. Por favor,
            volte para a etapa anterior para calcular as necessidades do
            paciente.
          </AlertDescription>
        </Alert>
        <Button onClick={goToPreviousStep} className="mt-4">
          Voltar para a Calculadora
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MealPlanGenerator
        calculationResults={nutritionalCalculations}
        initialMealPlan={mealPlan}
        onPlanChange={setMealPlan}
        onSaveDraft={saveWorkflowStateToSupabase}
      />
      <div className="flex justify-between w-full mt-6">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar para a Calculadora
        </Button>
        <Button
          onClick={async () => {
            await saveWorkflowStateToSupabase();
            alert('Plano salvo! Próxima etapa: Resumo.');
            // Futuramente, chamar aqui a função para ir para a próxima etapa
          }}
        >
          Finalizar e Salvar Plano
        </Button>
      </div>
    </div>
  );
}
