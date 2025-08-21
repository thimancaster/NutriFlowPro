
import React from 'react';
import { MealPlanWorkflowProvider } from '@/contexts/MealPlanWorkflowContext';
import { UnifiedClinicalWorkflow } from '@/components/workflow/UnifiedClinicalWorkflow';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

/**
 * PÁGINA DE CONSULTA CONSOLIDADA
 * 
 * Esta é a nova página padrão para atendimento nutricional.
 * Integra todo o fluxo consolidado em uma única interface.
 * 
 * SUBSTITUI: ConsultationPage, UnifiedConsultationPage
 */
const ConsolidatedConsultationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleWorkflowComplete = () => {
    toast({
      title: "Consulta Finalizada",
      description: "O atendimento nutricional foi concluído com sucesso!",
    });
    
    // Navegar para dashboard ou lista de pacientes
    navigate('/patients');
  };

  return (
    <MealPlanWorkflowProvider>
      <div className="container mx-auto p-6 max-w-7xl">
        <UnifiedClinicalWorkflow 
          onComplete={handleWorkflowComplete}
        />
      </div>
    </MealPlanWorkflowProvider>
  );
};

export default ConsolidatedConsultationPage;
