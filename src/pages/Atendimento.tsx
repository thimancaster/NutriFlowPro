
import React from 'react';
import { MealPlanWorkflowProvider } from '@/contexts/MealPlanWorkflowContext';
import { NutritionWorkflowProvider } from '@/contexts/NutritionWorkflowContext';
import { UnifiedNutritionProvider } from '@/contexts/UnifiedNutritionContext';
import UnifiedConsultationFlow from '@/components/workflow/UnifiedConsultationFlow';

/**
 * PÁGINA PRINCIPAL DE ATENDIMENTO UNIFICADO
 * 
 * Esta é a única rota para atendimento nutricional.
 * Substitui as antigas abas "Clínico" e "Consulta".
 * 
 * Fluxo: Seleção Paciente -> Cálculo -> Plano Alimentar -> Evolução
 */
const Atendimento: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNutritionProvider>
        <NutritionWorkflowProvider>
          <MealPlanWorkflowProvider>
            <div className="container mx-auto p-6 max-w-7xl">
              <UnifiedConsultationFlow />
            </div>
          </MealPlanWorkflowProvider>
        </NutritionWorkflowProvider>
      </UnifiedNutritionProvider>
    </div>
  );
};

export default Atendimento;
