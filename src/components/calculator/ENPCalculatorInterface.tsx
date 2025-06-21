
import React from 'react';
import { ENPCalculatorHeader } from './enp/ENPCalculatorHeader';
import { ENPCalculatorForm } from './enp/ENPCalculatorForm';
import PatientHistoryLoader from './components/PatientHistoryLoader';
import { usePatient } from '@/contexts/patient/PatientContext';
import { ENPCalculatorProvider, useENPCalculator } from '@/contexts/calculator/ENPCalculatorContext';
import { ActivityLevel, Objective } from '@/types/consultation';

/**
 * Um componente intermediário para carregar dados do histórico do paciente 
 * e preencher o estado do formulário através do contexto.
 */
const PatientDataLoader = () => {
  const { 
    setWeight, 
    setHeight, 
    setAge, 
    setSex, 
    setActivityLevel, 
    setObjective 
  } = useENPCalculator();
  const { activePatient } = usePatient();

  const handlePatientDataLoaded = (data: {
    weight: string;
    height: string;
    age: string;
    gender: 'male' | 'female';
    activityLevel: string;
    objective: string;
  }) => {
    setWeight(data.weight);
    setHeight(data.height);
    setAge(data.age);
    setSex(data.gender === 'male' ? 'M' : 'F');
    setActivityLevel(data.activityLevel as ActivityLevel);
    setObjective(data.objective as Objective);
  };

  if (!activePatient) return null;

  return (
    <PatientHistoryLoader
      patientId={activePatient.id}
      onDataLoaded={handlePatientDataLoaded}
    />
  );
};

interface ENPCalculatorInterfaceProps {
  onCalculationComplete?: (results: any) => void;
  onGenerateMealPlan?: () => void;
  onExportResults?: () => void;
}

export const ENPCalculatorInterface: React.FC<ENPCalculatorInterfaceProps> = ({
  onExportResults,
}) => {
  return (
    <ENPCalculatorProvider onExportResults={onExportResults}>
      <div className="space-y-6">
        <PatientDataLoader />
        <ENPCalculatorHeader />
        <ENPCalculatorForm />
      </div>
    </ENPCalculatorProvider>
  );
};
