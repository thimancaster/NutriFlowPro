
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Flame, Dumbbell, Utensils } from 'lucide-react';
import { CalculatorForm, ActivityForm, ResultsDisplay } from './components';
import { PatientDataHandler } from './components/PatientDataHandler';
import { CalculatorFooter } from './components/CalculatorFooter';
import { useCalculationSaveHandler } from './components/CalculationSaveHandler';
import { useMealPlanHandler } from './components/MealPlanHandler';
import useCalculatorState from './hooks/useCalculatorState';
import { Patient } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';

interface CalculatorToolProps {
  patientData?: Patient | null;
  onViewProfile?: () => void;
}

const CalculatorTool: React.FC<CalculatorToolProps> = ({ patientData, onViewProfile }) => {
  const { user } = useAuth();
  
  const {
    activeTab,
    weight,
    height,
    age,
    sex,
    activityLevel,
    objective,
    profile,
    tmbValue,
    teeObject,
    macros,
    calorieSummary,
    showResults,
    isCalculating,
    handleProfileChange,
    handleInputChange,
    handleCalculate,
    handleReset,
    setActiveTab,
    setSex,
    setActivityLevel,
    setObjective,
    formulaUsed
  } = useCalculatorState();

  // State management for patient data sync
  const [patientName, setPatientName] = React.useState<string>('');
  const [stateWeight, setStateWeight] = React.useState<string>('');
  const [stateHeight, setStateHeight] = React.useState<string>('');
  const [stateAge, setStateAge] = React.useState<string>('');
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // Initialize save handler
  const { handleSaveCalculation } = useCalculationSaveHandler({
    patientData,
    user,
    weight,
    height,
    age,
    sex,
    activityLevel,
    objective,
    tmbValue,
    teeObject,
    macros,
    isSaving,
    onSavingChange: setIsSaving
  });

  // Initialize meal plan handler
  const { handleGenerateMealPlan } = useMealPlanHandler({
    patientData,
    user,
    teeObject,
    macros,
    tmbValue,
    objective,
    onSaveCalculation: () => Promise.resolve(handleSaveCalculation())
  });

  // Fix the tab change handler to accept string and convert to proper type
  const handleTabChange = (value: string) => {
    if (value === 'tmb' || value === 'activity' || value === 'results') {
      setActiveTab(value);
    }
  };

  // Fix the async handler
  const handleSaveCalculationWrapper = async (): Promise<void> => {
    await handleSaveCalculation();
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <PatientDataHandler
        patientData={patientData}
        onPatientNameChange={setPatientName}
        onWeightChange={setStateWeight}
        onHeightChange={setStateHeight}
        onAgeChange={setStateAge}
        onSexChange={setSex}
        onInputChange={handleInputChange}
      />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Calculadora Nutricional
        </CardTitle>
        <CardDescription>
          Calcule TMB, GET e distribuição de macronutrientes para seus pacientes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="tmb" disabled={isCalculating}>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Dados</span> Básicos
              </span>
            </TabsTrigger>
            <TabsTrigger value="activity" disabled={isCalculating || !tmbValue}>
              <span className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4" />
                <span className="hidden sm:inline">Atividade</span> Física
              </span>
            </TabsTrigger>
            <TabsTrigger value="results" disabled={isCalculating || !showResults}>
              <span className="flex items-center gap-1">
                <Utensils className="h-4 w-4" />
                Resultados
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tmb" className="space-y-6">
            <CalculatorForm 
              weight={typeof weight === 'number' ? weight : 0}
              height={typeof height === 'number' ? height : 0}
              age={typeof age === 'number' ? age : 0}
              sex={sex}
              profile={profile}
              isCalculating={isCalculating}
              onInputChange={handleInputChange}
              onSexChange={setSex}
              onProfileChange={handleProfileChange}
              onCalculate={handleCalculate}
              patientSelected={!!patientData}
            />
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6">
            <ActivityForm 
              activityLevel={activityLevel}
              objective={objective}
              tmbValue={tmbValue}
              isCalculating={isCalculating}
              onActivityLevelChange={setActivityLevel}
              onObjectiveChange={setObjective}
              onCalculate={handleCalculate}
            />
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {showResults && (
              <ResultsDisplay 
                teeObject={teeObject}
                macros={macros}
                calorieSummary={calorieSummary}
                objective={objective}
                onSavePatient={handleSaveCalculationWrapper}
                onGenerateMealPlan={handleGenerateMealPlan}
                isSaving={isSaving}
                patientId={patientData?.id}
                weight={typeof weight === 'number' ? weight : undefined}
                height={typeof height === 'number' ? height : undefined}
                age={typeof age === 'number' ? age : undefined}
                sex={sex}
                bodyProfile={profile}
                activityLevel={activityLevel}
                tmb={tmbValue || undefined}
                formulaUsed={formulaUsed}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CalculatorFooter
        showResults={showResults}
        patientData={patientData}
        onViewProfile={onViewProfile}
        onSaveCalculation={handleSaveCalculationWrapper}
        onGenerateMealPlan={handleGenerateMealPlan}
        onReset={handleReset}
        isSaving={isSaving}
      />
    </Card>
  );
};

export default CalculatorTool;
