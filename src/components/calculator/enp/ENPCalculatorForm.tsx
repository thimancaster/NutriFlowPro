
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ENPDataInputs } from '../inputs/ENPDataInputs';
import { ENPValidation } from '../validation/ENPValidation';
import { ENPCalculationValidator } from '../validation/ENPCalculationValidator';
import { ENPResultsPanel } from '../ENPResultsPanel';
import ENPCalculatorActions from './ENPCalculatorActions';
import CalculatorActions from '../CalculatorActions';
import { ActivityLevel, Objective } from '@/types/consultation';

interface ENPCalculatorFormProps {
  // Form state
  weight: string;
  setWeight: (value: string) => void;
  height: string;
  setHeight: (value: string) => void;
  age: string;
  setAge: (value: string) => void;
  sex: 'M' | 'F';
  setSex: (value: 'M' | 'F') => void;
  activityLevel: ActivityLevel;
  setActivityLevel: (value: ActivityLevel) => void;
  objective: Objective;
  setObjective: (value: Objective) => void;
  
  // Validation and calculation
  validatedData: {
    weight: number;
    height: number;
    age: number;
    sex: 'M' | 'F';
    activityLevel: ActivityLevel;
    objective: Objective;
  };
  isValid: boolean;
  onCalculate: () => Promise<void>;
  
  // Calculator state
  isCalculating: boolean;
  error: string | null;
  results: any;
  onExportResults: () => void;
}

export const ENPCalculatorForm: React.FC<ENPCalculatorFormProps> = ({
  weight,
  setWeight,
  height,
  setHeight,
  age,
  setAge,
  sex,
  setSex,
  activityLevel,
  setActivityLevel,
  objective,
  setObjective,
  validatedData,
  isValid,
  onCalculate,
  isCalculating,
  error,
  results,
  onExportResults
}) => {
  const handleGenerateMealPlan = () => {
    // This will be implemented by the parent component
    console.log('Generate meal plan clicked');
  };

  const handleReset = () => {
    // This will be implemented by the parent component
    console.log('Reset clicked');
  };

  return (
    <Tabs defaultValue="calculator" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calculator">Calculadora ENP</TabsTrigger>
        <TabsTrigger value="validator">Validação Sistema</TabsTrigger>
      </TabsList>
      
      <TabsContent value="calculator" className="space-y-6">
        {/* Inputs de dados */}
        <ENPDataInputs
          weight={weight}
          setWeight={setWeight}
          height={height}
          setHeight={setHeight}
          age={age}
          setAge={setAge}
          sex={sex}
          setSex={setSex}
          activityLevel={activityLevel}
          setActivityLevel={setActivityLevel}
          objective={objective}
          setObjective={setObjective}
        />
        
        {/* Validação */}
        <ENPValidation data={validatedData} />
        
        {/* Botão de cálculo - only show if no results yet */}
        {!results && (
          <CalculatorActions
            isCalculating={isCalculating}
            calculateResults={onCalculate}
          />
        )}
        
        {/* Show error if exists */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* Resultados ENP */}
        {results && (
          <ENPResultsPanel
            results={results}
            weight={validatedData.weight}
            onExportResults={onExportResults}
          />
        )}

        {/* ENP Calculator Actions - only show when we have results */}
        {results && (
          <ENPCalculatorActions
            results={results}
            onExport={onExportResults}
            onGenerateMealPlan={handleGenerateMealPlan}
            onReset={handleReset}
          />
        )}
      </TabsContent>
      
      <TabsContent value="validator">
        <ENPCalculationValidator />
      </TabsContent>
    </Tabs>
  );
};
