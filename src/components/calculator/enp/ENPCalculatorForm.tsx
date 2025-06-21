
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ENPDataInputs } from '../inputs/ENPDataInputs';
import { ENPValidation } from '../validation/ENPValidation';
import { ENPCalculationValidator } from '../validation/ENPCalculationValidator';
import { ENPResultsPanel } from '../ENPResultsPanel';
import ENPCalculatorActions from './ENPCalculatorActions';
import CalculatorActions from '../CalculatorActions';
import GERFormulaSelection from '../inputs/GERFormulaSelection';
import { useENPCalculator } from '@/contexts/calculator/ENPCalculatorContext';
import { GERFormula } from '@/types/gerFormulas';

export const ENPCalculatorForm: React.FC = () => {
  const {
    // Estado e setters para ENPDataInputs
    weight, setWeight, height, setHeight, age, setAge, sex, setSex,
    activityLevel, setActivityLevel, objective, setObjective, profile, setProfile,
    bodyFatPercentage, setBodyFatPercentage, gerFormula, setGERFormula,
    
    // Dados validados e de validação
    validatedData, isValid, validationErrors, validationWarnings,
    
    // Ações e estado do cálculo
    handleCalculate, isCalculating, error, results, handleExportResults, handleReset,
  } = useENPCalculator();

  const handleGenerateMealPlan = () => {
    console.log('Generate meal plan clicked');
  };
  
  const transformedResults = results ? {
    tmb: results.tmb,
    get: results.gea,
    vet: results.get,
    adjustment: results.get - results.gea,
    macros: {
      protein: { grams: results.macros.protein.grams, kcal: results.macros.protein.kcal },
      carbs: { grams: results.macros.carbs.grams, kcal: results.macros.carbs.kcal },
      fat: { grams: results.macros.fat.grams, kcal: results.macros.fat.kcal },
    },
  } : null;

  // Transform validation errors and warnings to string arrays
  const errorMessages = validationErrors.map(error => error.message);
  const warningMessages = validationWarnings.map(warning => warning.message);

  return (
    <Tabs defaultValue="calculator" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calculator">Calculadora ENP</TabsTrigger>
        <TabsTrigger value="validator">Validação Sistema</TabsTrigger>
      </TabsList>
      
      <TabsContent value="calculator" className="space-y-6">
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
          onFormulaChange={(value) => setGERFormula(value as GERFormula)}
          profile={profile}
          hasBodyFat={!!validatedData.bodyFatPercentage}
          age={validatedData.age}
          weight={validatedData.weight}
          height={validatedData.height}
        />

        <ENPValidation errors={errorMessages} warnings={warningMessages} />
        
        {!results && (
          <CalculatorActions
            isCalculating={isCalculating}
            calculateResults={handleCalculate}
            disabled={!isValid}
          />
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}
        
        {results && transformedResults && (
          <>
            {results.gerFormulaName && (
              <div className="text-sm text-center text-gray-700 bg-gray-50 p-3 rounded-md border">
                Cálculo de TMB realizado com a fórmula: <strong>{results.gerFormulaName}</strong>
              </div>
            )}
            <ENPResultsPanel
              results={transformedResults}
              weight={validatedData.weight}
              onExportResults={handleExportResults}
            />
            <ENPCalculatorActions
              results={results}
              onExport={handleExportResults}
              onGenerateMealPlan={handleGenerateMealPlan}
              onReset={handleReset}
            />
          </>
        )}
      </TabsContent>
      
      <TabsContent value="validator">
        <ENPCalculationValidator />
      </TabsContent>
    </Tabs>
  );
};
