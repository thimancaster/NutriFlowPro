
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
    patientName, setPatientName,
    gender, setGender,
    age, setAge,
    weight, setWeight,
    height, setHeight,
    objective, setObjective,
    activityLevel, setActivityLevel,
    carbsPercentage, setCarbsPercentage,
    proteinPercentage, setProteinPercentage,
    fatPercentage, setFatPercentage,
    bmr, setBmr,
    tee, setTee,
    macros, setMacros,
    isCalculating, setIsCalculating,
    calculateResults,
    handleSavePatient,
    handleGenerateMealPlan,
    isSavingPatient
  } = useCalculatorState({ toast, user, setConsultationData: () => {} });

  const [consultationType, setConsultationType] = useState<string>('primeira_consulta');
  
  // Calculate combined percentage for validation
  const totalPercentage = 
    (parseInt(carbsPercentage) || 0) + 
    (parseInt(proteinPercentage) || 0) + 
    (parseInt(fatPercentage) || 0);
  
  const hasValidPercentages = totalPercentage === 100;
  const hasRequiredFields = patientName && age && weight && height;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <CalculatorInputs
          patientName={patientName}
          setPatientName={setPatientName}
          gender={gender}
          setGender={setGender}
          age={age}
          setAge={setAge}
          weight={weight}
          setWeight={setWeight}
          height={height}
          setHeight={setHeight}
          objective={objective}
          setObjective={setObjective}
          activityLevel={activityLevel}
          setActivityLevel={setActivityLevel}
          consultationType={consultationType}
          setConsultationType={setConsultationType}
          user={user}
        />
        
        <MacroDistributionInputs
          carbsPercentage={carbsPercentage}
          setCarbsPercentage={setCarbsPercentage}
          proteinPercentage={proteinPercentage}
          setProteinPercentage={setProteinPercentage}
          fatPercentage={fatPercentage}
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
                  calculateResults();
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
          carbsPercentage={carbsPercentage}
          proteinPercentage={proteinPercentage}
          fatPercentage={fatPercentage}
          handleSavePatient={handleSavePatient}
          handleGenerateMealPlan={handleGenerateMealPlan}
          isSavingPatient={isSavingPatient}
          hasPatientName={!!patientName}
          user={user}
        />
      </div>
    </div>
  );
};

export default CalculatorTool;
