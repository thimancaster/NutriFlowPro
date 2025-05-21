
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Flame, Dumbbell, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CalculatorForm, ActivityForm, ResultsDisplay } from './components';
import useCalculatorState from './hooks/useCalculatorState';
import { Patient } from '@/types';
import { useNavigate } from 'react-router-dom';
import { saveCalculationResults } from '@/services/calculationService';

interface CalculatorToolProps {
  patientData?: Patient | null;
}

const CalculatorTool: React.FC<CalculatorToolProps> = ({ patientData }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
    patientName,
    
    setActiveTab,
    setSex,
    setActivityLevel,
    setObjective,
    setPatientName,
    setWeight,
    setHeight,
    setAge,
    
    handleProfileChange,
    handleInputChange,
    handleCalculate,
    handleReset
  } = useCalculatorState();

  // Fill form with patient data when available
  useEffect(() => {
    if (patientData) {
      // Set patient name
      setPatientName(patientData.name);
      
      // Set measurements if available
      if (patientData.measurements) {
        if (patientData.measurements.weight) {
          setWeight(patientData.measurements.weight.toString());
        }
        if (patientData.measurements.height) {
          setHeight(patientData.measurements.height.toString());
        }
      }
      
      // Calculate age from birth_date if available
      if (patientData.birth_date) {
        const birthDate = new Date(patientData.birth_date);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        
        setAge(calculatedAge.toString());
      }
      
      // Set gender/sex if available
      if (patientData.gender) {
        setSex(patientData.gender === 'male' ? 'M' : 'F');
      }
    }
  }, [patientData, setPatientName, setWeight, setHeight, setAge, setSex]);

  // Handle saving calculation to patient record
  const handleSaveCalculation = async () => {
    if (!patientData || !teeObject || !macros) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os resultados. Certifique-se de que um paciente está selecionado e o cálculo foi realizado.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const calculationData = {
        patient_id: patientData.id,
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender: sex === 'M' ? 'male' : 'female',
        activity_level: activityLevel,
        goal: objective,
        bmr: tmbValue || 0,
        tdee: teeObject.vet || 0,
        protein: macros.protein.grams || 0,
        carbs: macros.carbs.grams || 0,
        fats: macros.fat.grams || 0,
        tipo: 'primeira_consulta',
        status: 'em_andamento'
      };
      
      const result = await saveCalculationResults(calculationData);
      
      if (result.success) {
        toast({
          title: "Cálculo salvo",
          description: "Os resultados foram salvos com sucesso para o paciente.",
        });
      } else {
        throw new Error(result.error || "Erro ao salvar cálculo");
      }
    } catch (error) {
      console.error("Error saving calculation:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os resultados.",
        variant: "destructive"
      });
    }
  };

  // Handle generating meal plan from calculation
  const handleGenerateMealPlan = () => {
    if (!patientData || !teeObject || !macros) {
      toast({
        title: "Informações incompletas",
        description: "Certifique-se de que um paciente está selecionado e o cálculo foi realizado.",
        variant: "destructive"
      });
      return;
    }
    
    // Save calculation first, then navigate
    handleSaveCalculation().then(() => {
      // Navigate to meal plan with calculation data
      navigate(`/meal-plans?patientId=${patientData.id}&createPlan=true`, {
        state: {
          calculationData: {
            bmr: tmbValue,
            tdee: teeObject.vet,
            protein: macros.protein.grams,
            carbs: macros.carbs.grams,
            fat: macros.fat.grams,
            objective: objective
          }
        }
      });
    });
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              weight={weight}
              height={height}
              age={age}
              sex={sex}
              profile={profile}
              patientName={patientName}
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
                weight={weight}
                patientSelected={!!patientData}
                onSavePatient={handleSaveCalculation}
                onGenerateMealPlan={handleGenerateMealPlan}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Limpar Dados
        </Button>
        
        {showResults && patientData && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleSaveCalculation}
            >
              Salvar Resultados
            </Button>
            
            <Button 
              variant="nutri"
              onClick={handleGenerateMealPlan}
            >
              Gerar Plano Alimentar
            </Button>
          </div>
        )}
        
        {showResults && !patientData && (
          <Button 
            variant="nutri"
            onClick={() => {
              toast({
                title: "Selecione um paciente",
                description: "Para salvar os resultados, você precisa selecionar um paciente.",
              });
            }}
          >
            Salvar Resultados
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CalculatorTool;
