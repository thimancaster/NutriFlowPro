import { useEffect } from 'react';
import { useOfficialCalculations } from '@/hooks/useOfficialCalculations';
import OfficialCalculatorForm from '@/components/calculator/official/OfficialCalculatorForm';
import CalculatorResults from '@/components/calculator/results/CalculatorResults';
import { usePatient } from '@/hooks/patient/usePatient';
import { Patient } from '@/types';

/**
 * Página principal da Calculadora Nutricional Oficial.
 * Esta página orquestra o estado da calculadora, os dados do paciente,
 * a exibição do formulário e a apresentação dos resultados.
 */
export default function CalculatorPage() {
  const {
    form,
    runCalculation,
    calculationResult,
    error,
    resetCalculator,
    loadPatientData,
    availableFormulas,
  } = useOfficialCalculations();

  // Exemplo de como carregar dados de um paciente (pode ser ajustado no futuro)
  // Por enquanto, esta lógica não está conectada, mas a estrutura está pronta.
  const { activePatient } = usePatient(); // Supondo que este hook forneça o paciente ativo

  useEffect(() => {
    if (activePatient) {
      loadPatientData(activePatient as Patient);
    }
  }, [activePatient, loadPatientData]);

  const onSubmit = (data: any) => {
    runCalculation(data);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Coluna do Formulário */}
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-4">Calculadora Nutricional</h1>
          <p className="text-muted-foreground mb-6">
            Preencha os dados abaixo para realizar o cálculo nutricional completo.
          </p>
          <OfficialCalculatorForm
            form={form}
            onSubmit={onSubmit}
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
            onSave={() => {
              // Lógica para salvar os resultados será implementada aqui no futuro
              console.log('Salvar resultados:', calculationResult);
            }}
            onGeneratePlan={() => {
              // Lógica para gerar o plano será implementada aqui no futuro
              console.log('Gerar plano com os resultados:', calculationResult);
            }}
          />
        </div>
      </div>
    </div>
  );
}
