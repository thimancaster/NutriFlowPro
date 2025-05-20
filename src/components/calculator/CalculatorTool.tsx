
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Flame, Dumbbell, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CalculatorForm, ActivityForm, ResultsDisplay } from './components';
import useCalculatorState from './hooks/useCalculatorState';

const CalculatorTool = () => {
  const { toast } = useToast();
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
    
    setActiveTab,
    setSex,
    setActivityLevel,
    setObjective,
    
    handleProfileChange,
    handleInputChange,
    handleCalculate,
    handleReset
  } = useCalculatorState();

  // Add useEffect to help with debugging
  useEffect(() => {
    console.log("CalculatorTool mounted");
    console.log("Initial state:", {
      activeTab,
      weight,
      height,
      age,
      sex,
      activityLevel,
      objective,
      profile,
      tmbValue,
      showResults
    });
    
    return () => {
      console.log("CalculatorTool unmounted");
    };
  }, []);
  
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
              isCalculating={isCalculating}
              onInputChange={handleInputChange}
              onSexChange={setSex}
              onProfileChange={handleProfileChange}
              onCalculate={handleCalculate}
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
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Limpar Dados
        </Button>
        
        {showResults && (
          <Button 
            variant="nutri"
            onClick={() => {
              toast({
                title: "Resultados salvos",
                description: "Os resultados foram salvos com sucesso.",
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
