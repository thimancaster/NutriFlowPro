
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  calculateTMB, 
  calculateGET, 
  calculateVET,
  calculateCalorieSummary
} from '@/utils/nutritionCalculations';
import { calculateMacrosByProfile } from '@/utils/macronutrientCalculations';
import { Profile } from '@/types/consultation';
import { 
  Calculator, 
  ArrowRight, 
  Info, 
  Dumbbell, 
  Utensils, 
  Flame, 
  Salad, 
  Beef, 
  Wheat, 
  Droplets 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CalculatorTool = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tmb');
  
  // Input states
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<'M' | 'F'>('F');
  const [activityLevel, setActivityLevel] = useState('moderado');
  const [objective, setObjective] = useState('manutenção');
  const [profile, setProfile] = useState<Profile>('eutrofico');
  
  // Result states
  const [tmbValue, setTmbValue] = useState<number | null>(null);
  const [teeObject, setTeeObject] = useState<{
    get: number;
    adjustment: number;
    vet: number;
  } | null>(null);
  const [macros, setMacros] = useState<any>(null);
  const [calorieSummary, setCalorieSummary] = useState<any>(null);
  
  // UI states
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Function to validate inputs
  const validateInputs = (weight: number, height: number, age: number): boolean => {
    if (weight <= 0 || weight > 300) return false;
    if (height <= 0 || height > 250) return false;
    if (age <= 0 || age > 120) return false;
    return true;
  };
  
  // Handle calculation
  const handleCalculate = () => {
    if (!weight || !height || !age) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateInputs(Number(weight), Number(height), Number(age))) {
      toast({
        title: "Valores inválidos",
        description: "Por favor, verifique se os valores estão dentro de limites razoáveis.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculating(true);
    
    // Simulate calculation delay for UX
    setTimeout(() => {
      try {
        // Calculate TMB
        const tmb = calculateTMB(Number(weight), Number(height), Number(age), sex);
        setTmbValue(tmb);
        
        // Calculate GET (Total Energy Expenditure)
        const get = calculateGET(tmb, activityLevel);
        
        // Calculate VET (adjusted calories based on objective)
        const vet = calculateVET(get, objective);
        
        setTeeObject({
          get,
          adjustment: vet / get,
          vet
        });
        
        // Calculate macronutrients
        const macrosResult = calculateMacrosByProfile(profile, Number(weight), vet);
        setMacros(macrosResult);
        
        // Calculate calorie summary
        const summary = calculateCalorieSummary({
          protein: { kcal: macrosResult.protein.kcal },
          carbs: { kcal: macrosResult.carbs.kcal },
          fats: { kcal: macrosResult.fat.kcal }
        });
        setCalorieSummary(summary);
        
        setShowResults(true);
        setActiveTab('results');
      } catch (error) {
        console.error("Calculation error:", error);
        toast({
          title: "Erro no cálculo",
          description: "Ocorreu um erro ao calcular os valores. Por favor, tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsCalculating(false);
      }
    }, 800);
  };
  
  // Reset form
  const handleReset = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setSex('F');
    setActivityLevel('moderado');
    setObjective('manutenção');
    setProfile('eutrofico');
    setTmbValue(null);
    setTeeObject(null);
    setMacros(null);
    setCalorieSummary(null);
    setShowResults(false);
    setActiveTab('tmb');
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weight">Peso (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Ex: 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="height">Altura (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Ex: 170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="age">Idade (anos) *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 30"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sex">Sexo *</Label>
                  <Select value={sex} onValueChange={(value) => setSex(value as 'M' | 'F')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="M">Masculino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="profile">Perfil Corporal</Label>
                  <Select value={profile} onValueChange={setProfile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="magro">Peso normal</SelectItem>
                      <SelectItem value="atleta">Atleta</SelectItem>
                      <SelectItem value="obeso">Sobrepeso/Obesidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleCalculate} 
                    className="w-full"
                    disabled={isCalculating || !weight || !height || !age}
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Calculando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Calcular <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="activity">Nível de Atividade Física</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Sedentário: pouco ou nenhum exercício</p>
                          <p>Leve: exercício 1-3x por semana</p>
                          <p>Moderado: exercício 3-5x por semana</p>
                          <p>Intenso: exercício 6-7x por semana</p>
                          <p>Muito intenso: exercício intenso diário ou físico profissional</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentario">Sedentário</SelectItem>
                      <SelectItem value="leve">Leve</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="intenso">Intenso</SelectItem>
                      <SelectItem value="muito_intenso">Muito Intenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="objective">Objetivo</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Emagrecimento: déficit calórico de 20%</p>
                          <p>Manutenção: calorias para manter o peso</p>
                          <p>Hipertrofia: superávit calórico de 15%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger>
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
              
              <div className="flex flex-col justify-between">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-500 mb-2">Taxa Metabólica Basal (TMB)</p>
                  <p className="text-2xl font-bold">{tmbValue} kcal</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Calorias necessárias em repouso completo
                  </p>
                </div>
                
                <Button 
                  onClick={handleCalculate} 
                  className="w-full mt-4"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Calculando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Calcular Macros <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {showResults && teeObject && macros && calorieSummary && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-blue-50 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Gasto Energético Total</h3>
                    </div>
                    <p className="text-2xl font-bold">{teeObject.get} kcal</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Calorias diárias com atividade física
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={cn(
                      "p-4 rounded-lg",
                      objective === 'emagrecimento' ? "bg-green-50" : 
                      objective === 'hipertrofia' ? "bg-purple-50" : "bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className={cn(
                        "h-5 w-5",
                        objective === 'emagrecimento' ? "text-green-500" : 
                        objective === 'hipertrofia' ? "text-purple-500" : "text-gray-500"
                      )} />
                      <h3 className="font-medium">Calorias Ajustadas</h3>
                    </div>
                    <p className="text-2xl font-bold">{teeObject.vet} kcal</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {objective === 'emagrecimento' 
                        ? `Déficit de ${Math.round((1 - teeObject.adjustment) * 100)}%` 
                        : objective === 'hipertrofia'
                          ? `Superávit de ${Math.round((teeObject.adjustment - 1) * 100)}%`
                          : 'Manutenção do peso atual'}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-amber-50 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Salad className="h-5 w-5 text-amber-500" />
                      <h3 className="font-medium">Distribuição Calórica</h3>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Proteínas: {macros.protein.percentage}%</span>
                      <span>Carbs: {macros.carbs.percentage}%</span>
                      <span>Gorduras: {macros.fats.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden flex">
                      <div 
                        className="bg-red-400 h-full" 
                        style={{ width: `${macros.protein.percentage}%` }}
                      ></div>
                      <div 
                        className="bg-green-400 h-full" 
                        style={{ width: `${macros.carbs.percentage}%` }}
                      ></div>
                      <div 
                        className="bg-yellow-400 h-full" 
                        style={{ width: `${macros.fats.percentage}%` }}
                      ></div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white border rounded-lg overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 border-b">
                    <h3 className="font-medium">Detalhamento de Macronutrientes</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center p-3 bg-red-50 rounded-lg">
                        <Beef className="h-10 w-10 text-red-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Proteínas</p>
                          <p className="text-xl font-bold">{macros.protein.grams}g</p>
                          <p className="text-xs text-gray-500">{macros.protein.kcal} kcal</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Wheat className="h-10 w-10 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Carboidratos</p>
                          <p className="text-xl font-bold">{macros.carbs.grams}g</p>
                          <p className="text-xs text-gray-500">{macros.carbs.kcal} kcal</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                        <Droplets className="h-10 w-10 text-yellow-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Gorduras</p>
                          <p className="text-xl font-bold">{macros.fats.grams}g</p>
                          <p className="text-xs text-gray-500">{macros.fats.kcal} kcal</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      <p>
                        • Proteínas: {Math.round(macros.protein.grams / Number(weight) * 10) / 10}g/kg de peso corporal
                      </p>
                      <p>
                        • Carboidratos: {Math.round(macros.carbs.grams / Number(weight) * 10) / 10}g/kg de peso corporal
                      </p>
                      <p>
                        • Gorduras: {Math.round(macros.fats.grams / Number(weight) * 10) / 10}g/kg de peso corporal
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
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
