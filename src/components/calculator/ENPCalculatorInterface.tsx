
import React from 'react';
import { ENPCalculatorHeader } from './enp/ENPCalculatorHeader';
import { ENPCalculatorForm } from './enp/ENPCalculatorForm';
import { useENPCalculatorLogic } from './enp/ENPCalculatorLogic';
import PatientHistoryLoader from './components/PatientHistoryLoader';
import { usePatient } from '@/contexts/patient/PatientContext';

interface ENPCalculatorInterfaceProps {
  onCalculationComplete?: (results: any) => void;
  onGenerateMealPlan?: () => void;
  onExportResults?: () => void;
}

export const ENPCalculatorInterface: React.FC<ENPCalculatorInterfaceProps> = ({
  onCalculationComplete,
  onGenerateMealPlan,
  onExportResults
}) => {
  const { activePatient } = usePatient();
  const calculatorLogic = useENPCalculatorLogic();
  
  const handlePatientDataLoaded = (data: {
    weight: string;
    height: string;
    age: string;
    gender: 'male' | 'female';
    activityLevel: string;
    objective: string;
    consultationType: 'primeira_consulta' | 'retorno';
  }) => {
    // Carregar dados da última consulta nos campos do formulário
    calculatorLogic.setWeight(data.weight);
    calculatorLogic.setHeight(data.height);
    calculatorLogic.setAge(data.age);
    calculatorLogic.setSex(data.gender === 'male' ? 'M' : 'F');
    calculatorLogic.setActivityLevel(data.activityLevel as any);
    calculatorLogic.setObjective(data.objective as any);
  };
  
  return (
    <div className="space-y-6">
      {/* Carregador de histórico do paciente */}
      {activePatient && (
        <PatientHistoryLoader
          patientId={activePatient.id}
          onDataLoaded={handlePatientDataLoaded}
        />
      )}
      
      {/* Informações sobre ENP */}
      <ENPCalculatorHeader />
      
      {/* Formulário principal */}
      <ENPCalculatorForm
        {...calculatorLogic}
        onCalculate={calculatorLogic.handleCalculate}
        onExportResults={onExportResults || calculatorLogic.handleExportResults}
      />
    </div>
  );
};
