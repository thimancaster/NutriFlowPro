
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ENPDataInputs } from '../inputs/ENPDataInputs';
import { ENPValidation } from '../validation/ENPValidation';
import { ENPCalculationValidator } from '../validation/ENPCalculationValidator';
import { ENPResultsPanel } from '../ENPResultsPanel';
import ENPCalculatorActions from './ENPCalculatorActions';
import CalculatorActions from '../CalculatorActions';
import { ActivityLevel, Objective, Profile } from '@/types/consultation';
import { GERFormula } from '@/types/gerFormulas';
import GERFormulaSelection from '../inputs/GERFormulaSelection';

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
  profile: Profile;
  setProfile: (value: Profile) => void;
  bodyFatPercentage: string;
  setBodyFatPercentage: (value: string) => void;
  gerFormula: GERFormula | undefined;
  setGERFormula: (value: GERFormula) => void;
  
  // Validation and calculation
  validatedData: {
    weight: number;
    height: number;
    age: number;
    sex: 'M' | 'F';
    activityLevel: ActivityLevel;
    objective: Objective;
    profile: Profile;
    gerFormula?: GERFormula;
    bodyFatPercentage?: number;
  };
  isValid: boolean;
  validationErrors: string[];
  validationWarnings: string[];
  onCalculate: () => Promise<void>;
  
  // Calculator state
  isCalculating: boolean;
  error: string | null;
  results: any;
  onExportResults: () => void;
  handleReset: () => void;
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
  profile,
  setProfile,
  bodyFatPercentage,
  setBodyFatPercentage,
  gerFormula,
  setGERFormula,
  validatedData,
  isValid,
  validationErrors,
  validationWarnings,
  onCalculate,
  isCalculating,
  error,
  results,
  onExportResults,
  handleReset
}) => {
  const handleGenerateMealPlan = () => {
    // This will be implemented by the parent component
    console.log('Generate meal plan clicked');
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
          profile={profile}
          setProfile={setProfile}
          bodyFatPercentage={bodyFatPercentage}
          setBodyFatPercentage={setBodyFatPercentage}
        />
        
        <GERFormulaSelection
            selectedFormula={gerFormula}
            onFormulaChange={setGERFormula}
            profile={profile}
            hasBodyFat={!!validatedData.bodyFatPercentage}
            required={true}
            age={validatedData.age}
            weight={validatedData.weight}
            height={validatedData.height}
        />

        {/* Validação */}
        <ENPValidation errors={validationErrors} warnings={validationWarnings} />
        
        {/* Botão de cálculo - only show if no results yet */}
        {!results && (
          <CalculatorActions
            isCalculating={isCalculating}
            calculateResults={onCalculate}
            disabled={!isValid}
          />
        )}
        
        {/* Show error if exists */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}
        
        {/* Resultados ENP */}
        {results && (
          <>
            {results.gerFormulaName && (
              <div className="text-sm text-center text-gray-700 bg-gray-50 p-3 rounded-md border">
                Cálculo de TMB realizado com a fórmula: <strong>{results.gerFormulaName}</strong>
              </div>
            )}
            <ENPResultsPanel
              results={results}
              weight={validatedData.weight}
              onExportResults={onExportResults}
            />
          </>
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
