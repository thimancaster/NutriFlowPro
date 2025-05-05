
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import CalculatorInputs from './CalculatorInputs';
import MacroDistributionInputs from './MacroDistributionInputs';
import CalculatorResults from './CalculatorResults';
import CalculatorActions from './CalculatorActions';
import useCalculatorState from './useCalculatorState';
import { handleSavePatient } from './handlers/patientHandlers';
import { handleGenerateMealPlan } from './handlers/mealPlanHandlers';

const CalculatorTool = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setConsultationData } = useConsultationData();
  const [activeTab, setActiveTab] = useState('calculator');
  const [isSavingPatient, setIsSavingPatient] = useState(false);
  
  const {
    calculatorState,
    setPatientName,
    setGender,
    setAge,
    setWeight,
    setHeight,
    setObjective,
    setActivityLevel,
    setCarbsPercentage,
    setProteinPercentage,
    setFatPercentage,
    isCalculating,
    calculateResults,
    bmr,
    tee,
    macros,
    tempPatientId
  } = useCalculatorState({ toast, user, setConsultationData });

  const onSavePatient = () => {
    handleSavePatient(
      calculatorState,
      user,
      navigate,
      toast,
      setIsSavingPatient
    );
  };

  const onGenerateMealPlan = () => {
    handleGenerateMealPlan(
      calculatorState,
      bmr,
      tee,
      macros,
      tempPatientId,
      setConsultationData,
      navigate,
      toast
    );
  };

  return (
    <Card className="nutri-card w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Calculadora Nutricional</CardTitle>
        <CardDescription>
          Calcule a Taxa Metabólica Basal (TMB), Gasto Energético Total (GET) e distribuição de macronutrientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} defaultValue="calculator" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            <TabsTrigger value="macros">Macronutrientes</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator">
            <CalculatorInputs 
              patientName={calculatorState.patientName}
              setPatientName={setPatientName}
              gender={calculatorState.gender}
              setGender={setGender}
              age={calculatorState.age}
              setAge={setAge}
              weight={calculatorState.weight}
              setWeight={setWeight}
              height={calculatorState.height}
              setHeight={setHeight}
              objective={calculatorState.objective}
              setObjective={setObjective}
              activityLevel={calculatorState.activityLevel}
              setActivityLevel={setActivityLevel}
              user={user}
            />
          </TabsContent>
          
          <TabsContent value="macros">
            <MacroDistributionInputs 
              carbsPercentage={calculatorState.carbsPercentage}
              setCarbsPercentage={setCarbsPercentage}
              proteinPercentage={calculatorState.proteinPercentage}
              setProteinPercentage={setProteinPercentage}
              fatPercentage={calculatorState.fatPercentage}
              setFatPercentage={setFatPercentage}
            />
          </TabsContent>
          
          <TabsContent value="results">
            <CalculatorResults 
              bmr={bmr}
              tee={tee}
              macros={macros}
              carbsPercentage={calculatorState.carbsPercentage}
              proteinPercentage={calculatorState.proteinPercentage}
              fatPercentage={calculatorState.fatPercentage}
              handleSavePatient={onSavePatient}
              handleGenerateMealPlan={onGenerateMealPlan}
              isSavingPatient={isSavingPatient}
              hasPatientName={!!calculatorState.patientName}
              user={user}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      {activeTab !== 'results' && (
        <CardFooter className="flex justify-end">
          <CalculatorActions 
            isCalculating={isCalculating}
            calculateResults={() => calculateResults(calculatorState)}
          />
        </CardFooter>
      )}
    </Card>
  );
};

export default CalculatorTool;
