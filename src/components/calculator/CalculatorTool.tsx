
import React, { useState } from 'react';
import CalculatorInputs from './CalculatorInputs';
import MacroDistributionInputs from './MacroDistributionInputs';
import CalculatorResults from './CalculatorResults';
import CalculatorActions from './CalculatorActions';
import { Card, CardContent } from "@/components/ui/card";
import useCalculatorState from './useCalculatorState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CalculatorTool = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Combine useCalculatorState with local state management
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
    handleSavePatient,
    handleGenerateMealPlan,
    isSavingPatient
  } = useCalculatorState({ toast, user, setConsultationData: () => {} });

  const [consultationType, setConsultationType] = useState<string>('primeira_consulta');
  
  // Calculate combined percentage for validation
  const totalPercentage = 
    (parseInt(calculatorState.carbsPercentage) || 0) + 
    (parseInt(calculatorState.proteinPercentage) || 0) + 
    (parseInt(calculatorState.fatPercentage) || 0);
  
  const hasValidPercentages = totalPercentage === 100;
  const hasRequiredFields = calculatorState.patientName && calculatorState.age && calculatorState.weight && calculatorState.height;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
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
          consultationType={consultationType}
          setConsultationType={setConsultationType}
          user={user}
        />
        
        <MacroDistributionInputs
          carbsPercentage={calculatorState.carbsPercentage}
          setCarbsPercentage={setCarbsPercentage}
          proteinPercentage={calculatorState.proteinPercentage}
          setProteinPercentage={setProteinPercentage}
          fatPercentage={calculatorState.fatPercentage}
          setFatPercentage={setFatPercentage}
        />
        
        {!hasValidPercentages && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded">
            A soma dos percentuais de macronutrientes deve ser igual a 100%. Atualmente: {totalPercentage}%
          </div>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <CalculatorActions
              isCalculating={isCalculating}
              calculateResults={() => {
                if (hasRequiredFields && hasValidPercentages) {
                  calculateResults(calculatorState);
                } else {
                  toast({
                    title: "Dados incompletos",
                    description: "Preencha todos os campos obrigatórios e ajuste os percentuais para totalizar 100%.",
                    variant: "destructive"
                  });
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <CalculatorResults
          bmr={bmr}
          tee={tee}
          macros={macros}
          carbsPercentage={calculatorState.carbsPercentage}
          proteinPercentage={calculatorState.proteinPercentage}
          fatPercentage={calculatorState.fatPercentage}
          handleSavePatient={handleSavePatient}
          handleGenerateMealPlan={handleGenerateMealPlan}
          isSavingPatient={isSavingPatient}
          hasPatientName={!!calculatorState.patientName}
          user={user}
        />
      </div>
    </div>
  );
};

export default CalculatorTool;
