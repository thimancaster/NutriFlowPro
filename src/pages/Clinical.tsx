import ClinicalWorkflow from '@/components/clinical/ClinicalWorkflow';

/**
 * Esta página agora serve como o ponto de entrada para o fluxo clínico unificado.
 */
export default function ClinicalPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <ClinicalWorkflow />
    </div>
  );
}
