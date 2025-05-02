
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const CalculatorTool = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States for form data
  const [gender, setGender] = useState('female');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('1.2');
  const [carbsPercentage, setCarbsPercentage] = useState('55'); // Updated to 55%
  const [proteinPercentage, setProteinPercentage] = useState('20'); // Updated to 20%
  const [fatPercentage, setFatPercentage] = useState('25'); // Updated to 25%

  // Results
  const [bmr, setBmr] = useState<number | null>(null);
  const [tee, setTee] = useState<number | null>(null);
  const [macros, setMacros] = useState<{ carbs: number, protein: number, fat: number } | null>(null);

  const [activeTab, setActiveTab] = useState('calculator');
  const [patientName, setPatientName] = useState('');
  const [objective, setObjective] = useState('manutenção');
  const [isCalculating, setIsCalculating] = useState(false);

  const validateInputs = (): boolean => {
    // Basic validation for required fields
    if (!age || !weight || !height) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos necessários.",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate reasonable values
    const ageVal = parseFloat(age);
    const weightVal = parseFloat(weight);
    const heightVal = parseFloat(height);
    
    if (ageVal <= 0 || ageVal > 120) {
      toast({
        title: "Valor inválido",
        description: "A idade deve estar entre 1 e 120 anos.",
        variant: "destructive"
      });
      return false;
    }
    
    if (weightVal <= 0 || weightVal > 300) {
      toast({
        title: "Valor inválido",
        description: "O peso deve estar entre 1 e 300 kg.",
        variant: "destructive"
      });
      return false;
    }
    
    if (heightVal <= 0 || heightVal > 250) {
      toast({
        title: "Valor inválido",
        description: "A altura deve estar entre 1 e 250 cm.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const calculateBMR = () => {
    if (!validateInputs()) {
      return;
    }
    
    setIsCalculating(true);
    
    const ageVal = parseFloat(age);
    const weightVal = parseFloat(weight);
    const heightVal = parseFloat(height);
    
    // Updated TMB calculation formulas for men and women
    let calculatedBmr;
    if (gender === 'male') {
      // Men: 66 + (13.7 * weight) + (5 * height) - (6.8 * age)
      calculatedBmr = 66 + (13.7 * weightVal) + (5 * heightVal) - (6.8 * ageVal);
    } else {
      // Women: 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)
      calculatedBmr = 655 + (9.6 * weightVal) + (1.8 * heightVal) - (4.7 * ageVal);
    }
    
    // Round TMB to the nearest whole number
    calculatedBmr = Math.round(calculatedBmr);
    setBmr(calculatedBmr);
    
    // Calculate Total Energy Expenditure with the selected activity factor
    const activityFactor = parseFloat(activityLevel);
    const calculatedTee = calculatedBmr * activityFactor;
    setTee(Math.round(calculatedTee));
    
    // Calculate macronutrients with updated distribution
    // Protein: 20%, Carbs: 55%, Fat: 25%
    const carbsPercent = parseFloat(carbsPercentage) / 100;
    const proteinPercent = parseFloat(proteinPercentage) / 100;
    const fatPercent = parseFloat(fatPercentage) / 100;
    
    setMacros({
      carbs: Math.round((calculatedTee * carbsPercent) / 4), // 4 calories per gram of carbs
      protein: Math.round((calculatedTee * proteinPercent) / 4), // 4 calories per gram of protein
      fat: Math.round((calculatedTee * fatPercent) / 9), // 9 calories per gram of fat
    });
    
    // After calculations are done, switch to results tab
    setActiveTab('results');
    setIsCalculating(false);
    
    toast({
      title: "Cálculo realizado com sucesso",
      description: "Os resultados do cálculo TMB e GET estão disponíveis na aba Resultados."
    });
  };

  const handleGenerateMealPlan = () => {
    if (!tee || !macros) return;
    
    // Create consultation-like data structure to pass to meal plan generator
    const consultationData = {
      age: age,
      objective: objective,
      gender: gender,
      weight: weight,
      height: height,
      activityLevel: activityLevel,
      results: {
        get: tee,
        macros: {
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat
        }
      }
    };
    
    // Create patient-like data structure
    const patientData = {
      name: patientName || "Paciente",
      gender: gender,
      id: Date.now().toString() // Temporary ID for demonstration
    };
    
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
          
          <TabsContent value="calculator" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="patientName">Nome do Paciente (opcional)</Label>
                  <Input 
                    id="patientName" 
                    value={patientName} 
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nome do paciente"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Sexo</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="age">Idade (anos)</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ex: 35"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ex: 70"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ex: 170"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="objective">Objetivo</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger id="objective">
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                      <SelectItem value="manutenção">Manutenção</SelectItem>
                      <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <Label htmlFor="activity">Nível de Atividade</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger id="activity">
                  <SelectValue placeholder="Selecione o nível de atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.2">Sedentário (pouco ou nenhum exercício)</SelectItem>
                  <SelectItem value="1.375">Levemente ativo (exercício leve 1-3 dias/semana)</SelectItem>
                  <SelectItem value="1.55">Moderadamente ativo (exercício moderado 3-5 dias/semana)</SelectItem>
                  <SelectItem value="1.725">Muito ativo (exercício intenso 6-7 dias/semana)</SelectItem>
                  <SelectItem value="1.9">Extremamente ativo (exercício muito intenso, trabalho físico)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="macros" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="carbs">
                  Carboidratos (%) - {carbsPercentage}%
                </Label>
                <Input 
                  id="carbs" 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={carbsPercentage} 
                  onChange={(e) => {
                    setCarbsPercentage(e.target.value);
                    setProteinPercentage((100 - parseInt(e.target.value) - parseInt(fatPercentage)).toString());
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="protein">
                  Proteínas (%) - {proteinPercentage}%
                </Label>
                <Input 
                  id="protein" 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={proteinPercentage} 
                  onChange={(e) => {
                    setProteinPercentage(e.target.value);
                    setCarbsPercentage((100 - parseInt(e.target.value) - parseInt(fatPercentage)).toString());
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fat">
                  Gorduras (%) - {fatPercentage}%
                </Label>
                <Input 
                  id="fat" 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={fatPercentage} 
                  onChange={(e) => {
                    setFatPercentage(e.target.value);
                    setProteinPercentage((100 - parseInt(carbsPercentage) - parseInt(e.target.value)).toString());
                  }}
                  className="w-full"
                />
              </div>

              <div className="text-center text-sm text-gray-500">
                Total: {parseInt(carbsPercentage) + parseInt(proteinPercentage) + parseInt(fatPercentage)}% (deve ser 100%)
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {bmr !== null && tee !== null ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-nutri-gray-light">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Taxa Metabólica Basal (TMB)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-nutri-green-dark">{bmr} kcal/dia</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Energia necessária para manter as funções vitais em repouso.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-nutri-gray-light">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Gasto Energético Total (GET)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-nutri-blue-dark">{tee} kcal/dia</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Energia total necessária, considerando seu nível de atividade.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {macros && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Distribuição de Macronutrientes</CardTitle>
                      <CardDescription>
                        Baseado em: {carbsPercentage}% Carboidratos, {proteinPercentage}% Proteínas, {fatPercentage}% Gorduras
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Carboidratos</p>
                          <p className="text-xl font-bold text-nutri-green">{macros.carbs}g</p>
                          <p className="text-sm">{parseInt(carbsPercentage)}% / {macros.carbs * 4} kcal</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Proteínas</p>
                          <p className="text-xl font-bold text-nutri-blue">{macros.protein}g</p>
                          <p className="text-sm">{parseInt(proteinPercentage)}% / {macros.protein * 4} kcal</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Gorduras</p>
                          <p className="text-xl font-bold text-nutri-teal">{macros.fat}g</p>
                          <p className="text-sm">{parseInt(fatPercentage)}% / {macros.fat * 9} kcal</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center mt-4">
                  <Button 
                    onClick={handleGenerateMealPlan} 
                    className="bg-nutri-green hover:bg-nutri-green-dark flex items-center gap-2"
                    size="lg"
                  >
                    Gerar Plano Alimentar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">Complete os dados e calcule para ver os resultados</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      {activeTab !== 'results' && (
        <CardFooter className="flex justify-end">
          <Button onClick={calculateBMR} className="bg-nutri-green hover:bg-nutri-green-dark">
            Calcular
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CalculatorTool;
