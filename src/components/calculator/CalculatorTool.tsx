
import React, { useState, useEffect } from 'react';
import CalculatorInputs from './CalculatorInputs';
import MacroDistributionInputs from './MacroDistributionInputs';
import CalculatorResults from './CalculatorResults';
import CalculatorActions from './CalculatorActions';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, User } from 'lucide-react';
import useCalculatorState from './useCalculatorState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePatient } from '@/contexts/PatientContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { ToastApi } from './types';
import { calculateBMR, calculateTEE, calculateMacros } from './utils/calculations';

const CalculatorTool = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activePatient } = usePatient();
  const { setConsultationData } = useConsultationData();
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Create a wrapper for toast that matches the expected type
  const toastWrapper: ToastApi = {
    toast: (props) => toast(props),
    dismiss: (id?: string) => {}
  };
  
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
    setProfile,
    setConsultationType,
    clearCalculatorData,
    bmr,
    tee,
    macros,
    handleSavePatient,
    handleGenerateMealPlan,
    isSavingPatient
  } = useCalculatorState({ 
    toast: toastWrapper, 
    user, 
    setConsultationData, 
    activePatient 
  });
  
  // Calculate combined percentage for validation
  const totalPercentage = 
    (parseInt(calculatorState.carbsPercentage) || 0) + 
    (parseInt(calculatorState.proteinPercentage) || 0) + 
    (parseInt(calculatorState.fatPercentage) || 0);
  
  const hasValidPercentages = totalPercentage === 100;
  const hasRequiredFields = !!calculatorState.patientName && 
                           !!calculatorState.age && 
                           !!calculatorState.weight && 
                           !!calculatorState.height;
  
  // Function to handle calculation
  const handleCalculate = () => {
    if (!hasRequiredFields) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios: nome, idade, peso e altura.",
        variant: "destructive"
      });
      return;
    }
    
    if (!hasValidPercentages) {
      toast({
        title: "Distribuição inválida",
        description: "A soma dos percentuais de macronutrientes deve ser 100%.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculating(true);
    
    try {
      // Calculate BMR
      const calculatedBMR = calculateBMR(
        calculatorState.gender,
        calculatorState.weight.toString(),
        calculatorState.height.toString(),
        calculatorState.age.toString()
      );
      
      // Calculate TEE
      const calculatedTEE = calculateTEE(
        calculatedBMR,
        calculatorState.activityLevel,
        calculatorState.objective
      );
      
      // Calculate macros
      const calculatedMacros = calculateMacros(
        calculatedTEE.vet,
        calculatorState.carbsPercentage,
        calculatorState.proteinPercentage,
        calculatorState.fatPercentage,
        Number(calculatorState.weight)
      );
      
      // Update the calculator state with the calculated values through existing context/hooks
      console.log('Calculated values:', { 
        bmr: calculatedBMR, 
        tee: calculatedTEE.vet, 
        macros: calculatedMacros 
      });
      
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao calcular. Verifique os dados informados.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {activePatient && (
          <Alert className="bg-blue-50 border-blue-200">
            <User className="h-4 w-4" />
            <AlertTitle>Paciente Ativo</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Calculando para: <strong>{activePatient.name}</strong></span>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={clearCalculatorData}
              >
                <RefreshCw className="h-3 w-3" />
                Limpar
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
          consultationType={calculatorState.consultationType}
          setConsultationType={setConsultationType}
          profile={calculatorState.profile}
          setProfile={setProfile}
          user={user}
          activePatient={activePatient}
        />
        
        <MacroDistributionInputs
          carbsPercentage={calculatorState.carbsPercentage}
          setCarbsPercentage={setCarbsPercentage}
          proteinPercentage={calculatorState.proteinPercentage}
          setProteinPercentage={setProteinPercentage}
          fatPercentage={calculatorState.fatPercentage}
          setFatPercentage={setFatPercentage}
          bmr={bmr}
          tee={tee}
          objective={calculatorState.objective}
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
              calculateResults={handleCalculate}
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
