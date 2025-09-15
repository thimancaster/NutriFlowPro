
import React from 'react';
import { ClinicalWorkflowProvider } from '@/contexts/ClinicalWorkflowContext';
import UnifiedClinicalPage from '@/components/clinical/UnifiedClinicalPage';

/**
 * PÁGINA CLÍNICA CONSOLIDADA
 * 
 * Esta é a nova página unificada para todo o atendimento nutricional.
 * Integra sessões clínicas com histórico completo e pré-preenchimento inteligente.
 * 
 * ARQUITETURA UNIFICADA:
 * - Elimina redundância da funcionalidade "Consulta"
 * - Trata cada atendimento como "Sessão Clínica" persistida
 * - Pré-preenchimento automático para acompanhamentos
 * - Histórico completo de evolução do paciente
 */
const ConsolidatedConsultationPage: React.FC = () => {
  return (
    <ClinicalWorkflowProvider>
      <UnifiedClinicalPage />
    </ClinicalWorkflowProvider>
  );
};

export default ConsolidatedConsultationPage;
