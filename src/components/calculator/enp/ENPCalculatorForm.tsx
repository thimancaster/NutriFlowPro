import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ENPDataInputs } from '../inputs/ENPDataInputs';
import { ENPValidation } from '../validation/ENPValidation';
import { ENPCalculationValidator } from '../validation/ENPCalculationValidator';
import { ENPResultsPanel } from '../ENPResultsPanel';
import ENPCalculatorActions from './ENPCalculatorActions';
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
        
        {/* Botão de cálculo */}
        <ENPCalculatorActions
          onCalculate={onCalculate}
          isValid={isValid}
          isCalculating={isCalculating}
          error={error}
        />
        
        {/* Resultados ENP */}
        {results && (
          <ENPResultsPanel
            results={results}
            weight={validatedData.weight}
            onExportResults={onExportResults}
          />
        )}
      </TabsContent>
      
      <TabsContent value="validator">
        <ENPCalculationValidator />
      </TabsContent>
    </Tabs>
  );
};
