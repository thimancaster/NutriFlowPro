
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Flame, Dumbbell, Utensils, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalculatorForm, ActivityForm, ResultsDisplay } from './components';
import useCalculatorState from './hooks/useCalculatorState';
import { Patient } from '@/types';
import { useNavigate } from 'react-router-dom';
import { saveCalculationResults } from '@/services/calculationService';
import { useAuth } from '@/contexts/auth/AuthContext';

interface CalculatorToolProps {
  patientData?: Patient | null;
  onViewProfile?: () => void;
}

const CalculatorTool: React.FC<CalculatorToolProps> = ({ patientData, onViewProfile }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
    setObjective
  } = useCalculatorState();

  // Manually store patient name from patient data
  const [patientName, setPatientName] = React.useState<string>('');
  
  // Add explicit state setters for weight, height, and age
  const [stateWeight, setStateWeight] = React.useState<string>('');
  const [stateHeight, setStateHeight] = React.useState<string>('');
  const [stateAge, setStateAge] = React.useState<string>('');
  
  // Add state for saving status
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // Fill form with patient data when available
  useEffect(() => {
    if (patientData) {
      // Set patient name
      setPatientName(patientData.name);
      
      // Set measurements if available
      if (patientData.measurements) {
        if (patientData.measurements.weight) {
          setStateWeight(patientData.measurements.weight.toString());
          handleInputChange('weight', Number(patientData.measurements.weight));
        }
        if (patientData.measurements.height) {
          setStateHeight(patientData.measurements.height.toString());
          handleInputChange('height', Number(patientData.measurements.height));
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
        
        setStateAge(calculatedAge.toString());
        handleInputChange('age', calculatedAge);
      }
      
      // Set gender/sex if available
      if (patientData.gender) {
        setSex(patientData.gender === 'male' ? 'M' : 'F');
      }
    }
  }, [patientData]);

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
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar os resultados.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Convert weight, height, age to numbers with proper fallbacks
      const weightValue = typeof weight === 'number' ? weight : parseFloat(weight.toString()) || 0;
      const heightValue = typeof height === 'number' ? height : parseFloat(height.toString()) || 0;
      const ageValue = typeof age === 'number' ? age : parseInt(age.toString()) || 0;
      
      const calculationData = {
        patient_id: patientData.id,
        user_id: user.id,
        weight: weightValue,
        height: heightValue,
        age: ageValue,
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
        description: "Ocorreu um erro ao salvar os resultados. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para gerar um plano.",
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
                onSavePatient={handleSaveCalculation}
                onGenerateMealPlan={handleGenerateMealPlan}
                isSaving={isSaving}
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
            {onViewProfile && (
              <Button
                variant="secondary"
                onClick={onViewProfile}
              >
                <User className="mr-2 h-4 w-4" />
                Ver Perfil
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={handleSaveCalculation}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Resultados'}
            </Button>
            
            <Button 
              variant="nutri"
              onClick={handleGenerateMealPlan}
              disabled={isSaving}
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
