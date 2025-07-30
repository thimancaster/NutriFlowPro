
import React from 'react';
import { ENPCalculatorHeader } from './enp/ENPCalculatorHeader';
import { ENPCalculatorForm } from './enp/ENPCalculatorForm';
import { usePatient } from '@/contexts/patient/PatientContext';

interface ENPCalculatorInterfaceProps {
  onCalculationComplete?: (results: any) => void;
  onGenerateMealPlan?: () => void;
  onExportResults?: () => void;
}

export const ENPCalculatorInterface: React.FC<ENPCalculatorInterfaceProps> = ({
  onExportResults,
}) => {
  const { activePatient } = usePatient();

  return (
    <div className="space-y-6">
      {/* Header */}
      <ENPCalculatorHeader />
      
      {/* Patient Info */}
      {activePatient && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Paciente Ativo: {activePatient.name}</h3>
          <div className="flex gap-4 text-sm text-muted-foreground">
            {activePatient.birth_date && (
              <span>Idade: {new Date().getFullYear() - new Date(activePatient.birth_date).getFullYear()} anos</span>
            )}
            {activePatient.gender && (
              <span>Sexo: {activePatient.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <ENPCalculatorForm />
    </div>
  );
};
