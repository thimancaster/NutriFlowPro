
import React, { useState } from 'react';
import CalculatorInputs from './CalculatorInputs';
import MacroDistributionInputs from './MacroDistributionInputs';
import CalculatorResults from './CalculatorResults';
import CalculatorActions from './CalculatorActions';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, User } from 'lucide-react';
import { useCalculator } from '@/contexts/CalculatorContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import { useToast } from '@/hooks/use-toast';

const CalculatorTool = () => {
  const { user } = useAuth();
  const { activePatient } = usePatient();
  const { toast } = useToast();
  const { calculatorState, calculatorDispatch, calculateNutritionalNeeds } = useCalculator();
  
  // Função para limpar os dados da calculadora
  const clearCalculatorData = () => {
    calculatorDispatch({ type: 'RESET' });
    toast({
      title: "Dados limpos",
      description: "Os campos da calculadora foram redefinidos.",
    });
  };
  
  // Verificar se temos todos os dados necessários
  const hasRequiredFields = !!calculatorState.patientName && 
                           !!calculatorState.age && 
                           !!calculatorState.weight && 
                           !!calculatorState.height;
  
  // Verificar se a distribuição de macronutrientes é válida
  const totalPercentage = 
    (parseInt(calculatorState.carbsPercentage) || 0) + 
    (parseInt(calculatorState.proteinPercentage) || 0) + 
    (parseInt(calculatorState.fatPercentage) || 0);
  
  const hasValidPercentages = totalPercentage === 100;
  
  // Função para calcular os resultados
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
    
    calculateNutritionalNeeds();
  };
  
  // Funções para manejar as ações do usuário após o cálculo
  const handleSavePatient = async () => {
    try {
      // Implementação futura para salvar o paciente
      toast({
        title: "Implementação futura",
        description: "A funcionalidade de salvar paciente será implementada em breve."
      });
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o paciente.",
        variant: "destructive"
      });
    }
  };
  
  const handleGenerateMealPlan = () => {
    try {
      // Implementação futura para gerar plano alimentar
      toast({
        title: "Implementação futura",
        description: "A geração de plano alimentar será implementada em breve."
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Erro ao gerar plano",
        description: "Não foi possível gerar o plano alimentar.",
        variant: "destructive"
      });
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
          setPatientName={(value) => calculatorDispatch({ type: 'SET_PATIENT_NAME', payload: value })}
          gender={calculatorState.gender}
          setGender={(value) => calculatorDispatch({ type: 'SET_GENDER', payload: value })}
          age={calculatorState.age}
          setAge={(value) => calculatorDispatch({ type: 'SET_AGE', payload: value })}
          weight={calculatorState.weight}
          setWeight={(value) => calculatorDispatch({ type: 'SET_WEIGHT', payload: value })}
          height={calculatorState.height}
          setHeight={(value) => calculatorDispatch({ type: 'SET_HEIGHT', payload: value })}
          objective={calculatorState.objective}
          setObjective={(value) => calculatorDispatch({ type: 'SET_OBJECTIVE', payload: value })}
          activityLevel={calculatorState.activityLevel}
          setActivityLevel={(value) => calculatorDispatch({ type: 'SET_ACTIVITY_LEVEL', payload: value })}
          consultationType={calculatorState.consultationType}
          setConsultationType={(value) => calculatorDispatch({ type: 'SET_CONSULTATION_TYPE', payload: value })}
          profile={calculatorState.profile}
          setProfile={(value) => calculatorDispatch({ type: 'SET_PROFILE', payload: value })}
          user={user}
          activePatient={activePatient}
        />
        
        <MacroDistributionInputs
          carbsPercentage={calculatorState.carbsPercentage}
          setCarbsPercentage={(value) => calculatorDispatch({ type: 'SET_CARBS_PERCENTAGE', payload: value })}
          proteinPercentage={calculatorState.proteinPercentage}
          setProteinPercentage={(value) => calculatorDispatch({ type: 'SET_PROTEIN_PERCENTAGE', payload: value })}
          fatPercentage={calculatorState.fatPercentage}
          setFatPercentage={(value) => calculatorDispatch({ type: 'SET_FAT_PERCENTAGE', payload: value })}
          bmr={calculatorState.bmr || 0}
          tee={calculatorState.tee?.vet || 0}
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
              isCalculating={calculatorState.isCalculating}
              calculateResults={handleCalculate}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <CalculatorResults
          bmr={calculatorState.bmr || 0}
          tee={calculatorState.tee?.vet || 0}
          macros={calculatorState.macros}
          carbsPercentage={calculatorState.carbsPercentage}
          proteinPercentage={calculatorState.proteinPercentage}
          fatPercentage={calculatorState.fatPercentage}
          handleSavePatient={handleSavePatient}
          handleGenerateMealPlan={handleGenerateMealPlan}
          isSavingPatient={false}
          hasPatientName={!!calculatorState.patientName}
          user={user}
        />
      </div>
    </div>
  );
};

export default CalculatorTool;
