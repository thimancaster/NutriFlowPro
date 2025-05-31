
import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { ENPCalculatorInterface } from './ENPCalculatorInterface';
import CalculatorResults from './CalculatorResults';
import CalculatorActions from './CalculatorActions';
import { Card, CardContent } from '@/components/ui/card';

const CalculatorTool: React.FC = () => {
  const { user } = useAuth();
  const { activePatient } = usePatient();
  
  const [calculationResults, setCalculationResults] = React.useState<any>(null);

  const handleCalculationComplete = (results: any) => {
    setCalculationResults(results);
  };

  const handleSavePatient = async () => {
    if (!user) return;
    
    // Aqui você pode implementar a lógica de salvar paciente
    console.log('Saving patient...');
  };

  const handleGenerateMealPlan = async () => {
    if (!user || !activePatient || !calculationResults) return;
    
    // Aqui você pode implementar a lógica de gerar plano alimentar
    console.log('Generating meal plan with results:', calculationResults);
  };

  const handleExportResults = () => {
    if (!calculationResults) return;
    
    // Implementar exportação dos resultados
    const exportData = {
      timestamp: new Date().toISOString(),
      patient: activePatient ? { 
        id: activePatient.id, 
        name: activePatient.name 
      } : null,
      results: calculationResults
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculo-enp-${activePatient?.name || 'patient'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interface ENP */}
        <div className="space-y-6">
          <ENPCalculatorInterface 
            onCalculationComplete={handleCalculationComplete}
            onGenerateMealPlan={handleGenerateMealPlan}
            onExportResults={handleExportResults}
          />
        </div>

        {/* Resultados do Calculador (versão simplificada para compatibilidade) */}
        {calculationResults && (
          <CalculatorResults
            bmr={calculationResults.tmb || 0}
            tee={{
              get: calculationResults.get || 0,
              vet: calculationResults.vet || 0,
              adjustment: calculationResults.adjustment || 0
            }}
            macros={calculationResults.macros || null}
            handleSavePatient={handleSavePatient}
            handleGenerateMealPlan={handleGenerateMealPlan}
            isSavingPatient={false}
            hasPatientName={true}
            user={user}
            weight={70} // Será obtido dos inputs ENP
            height={175} // Será obtido dos inputs ENP
            age={30} // Será obtido dos inputs ENP
            sex="M" // Será obtido dos inputs ENP
          />
        )}
      </div>
    </div>
  );
};

export default CalculatorTool;
