
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { v4 as uuidv4 } from 'uuid';
import CalculatorInputs from './CalculatorInputs';
import MacroDistributionInputs from './MacroDistributionInputs';
import CalculatorResults from './CalculatorResults';
import useCalculatorState from './useCalculatorState';

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
    tempPatientId,
    setTempPatientId
  } = useCalculatorState({ toast, user, setConsultationData });

  const handleSavePatient = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para cadastrar pacientes.",
        variant: "destructive"
      });
      return;
    }
    
    if (!calculatorState.patientName || !calculatorState.age) {
      toast({
        title: "Dados incompletos",
        description: "O nome do paciente e a idade são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSavingPatient(true);
    
    try {
      // Navigate to the patients page with data for registration
      navigate('/patients', {
        state: {
          newPatient: {
            name: calculatorState.patientName,
            gender: calculatorState.gender === 'male' ? 'M' : 'F',
            age: calculatorState.age,
            height: calculatorState.height,
            weight: calculatorState.weight,
            objective: calculatorState.objective
          }
        }
      });
      
      toast({
        title: "Redirecionando...",
        description: "Complete o cadastro do paciente para salvar os dados."
      });
    } catch (error) {
      console.error("Error navigating to patient registration:", error);
      toast({
        title: "Erro",
        description: "Não foi possível redirecionar para o cadastro de pacientes.",
        variant: "destructive"
      });
    } finally {
      setIsSavingPatient(false);
    }
  };

  const handleGenerateMealPlan = () => {
    if (!tee || !macros) return;
    
    // Create consultation-like data structure to pass to meal plan generator
    const consultationData = {
      age: calculatorState.age,
      objective: calculatorState.objective,
      sex: calculatorState.gender === 'male' ? 'M' : 'F',
      weight: calculatorState.weight,
      height: calculatorState.height,
      activityLevel: calculatorState.activityLevel,
      results: {
        get: tee,
        tmb: bmr || 0,
        fa: parseFloat(calculatorState.activityLevel),
        macros: {
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat
        }
      }
    };
    
    // Create patient-like data structure
    const patientData = {
      name: calculatorState.patientName || "Paciente",
      gender: calculatorState.gender === 'male' ? 'male' : 'female',
      id: tempPatientId || Date.now().toString() // Use temp ID if available
    };
    
    // Set consultation data in context
    setConsultationData(consultationData);
    
    // Navigate to meal plan generator with the data
    navigate('/meal-plan-generator', {
      state: {
        consultation: consultationData,
        patient: patientData
      }
    });
    
    toast({
      title: "Redirecionando para o plano alimentar",
      description: "Preparando interface para montagem do plano alimentar."
    });
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
              handleSavePatient={handleSavePatient}
              handleGenerateMealPlan={handleGenerateMealPlan}
              isSavingPatient={isSavingPatient}
              hasPatientName={!!calculatorState.patientName}
              user={user}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      {activeTab !== 'results' && (
        <CardFooter className="flex justify-end">
          <Button 
            onClick={() => calculateResults(calculatorState)} 
            className="bg-nutri-green hover:bg-nutri-green-dark"
            disabled={isCalculating}
          >
            Calcular
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CalculatorTool;
