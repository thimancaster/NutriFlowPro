
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const activityFactors = {
  sedentário: 1.2,
  moderado: 1.55,
  alto: 1.9,
};

const TmbFormula = {
  // Harris-Benedict formula
  default: {
    M: (weight: number, height: number, age: number) => 66.5 + (13.75 * weight) + (5.003 * height) - (6.775 * age),
    F: (weight: number, height: number, age: number) => 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age)
  },
  // Mifflin-St Jeor formula (for obese)
  obeso: {
    M: (weight: number, height: number, age: number) => (10 * weight) + (6.25 * height) - (5 * age) + 5,
    F: (weight: number, height: number, age: number) => (10 * weight) + (6.25 * height) - (5 * age) - 161
  },
  // Katch-McArdle formula (for athletes)
  atleta: {
    M: (weight: number, height: number, age: number, bodyFat = 15) => 370 + (21.6 * (weight * (1 - (bodyFat / 100)))),
    F: (weight: number, height: number, age: number, bodyFat = 20) => 370 + (21.6 * (weight * (1 - (bodyFat / 100))))
  }
};

const calculateMacros = (totalCalories: number, objective: string) => {
  let protein = 0;
  let carbs = 0; 
  let fat = 0;
  
  switch (objective) {
    case 'emagrecimento':
      protein = (totalCalories * 0.35) / 4; // 35% protein
      fat = (totalCalories * 0.35) / 9; // 35% fat
      carbs = (totalCalories * 0.3) / 4; // 30% carbs
      break;
    case 'manutenção':
      protein = (totalCalories * 0.3) / 4; // 30% protein
      fat = (totalCalories * 0.3) / 9; // 30% fat
      carbs = (totalCalories * 0.4) / 4; // 40% carbs
      break;
    case 'hipertrofia':
      protein = (totalCalories * 0.3) / 4; // 30% protein
      fat = (totalCalories * 0.2) / 9; // 20% fat
      carbs = (totalCalories * 0.5) / 4; // 50% carbs
      break;
    default:
      protein = (totalCalories * 0.3) / 4;
      fat = (totalCalories * 0.3) / 9;
      carbs = (totalCalories * 0.4) / 4;
  }
  
  return { protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
};

const Consultation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    sex: 'M',
    objective: 'manutenção',
    profile: 'magro',
    activityLevel: 'moderado',
  });
  
  const [results, setResults] = useState({
    tmb: 0,
    fa: 1.55, // default moderate
    get: 0,
    macros: { protein: 0, carbs: 0, fat: 0 }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Calculate results whenever form data changes
  useEffect(() => {
    const { weight, height, age, sex, objective, profile, activityLevel } = formData;
    
    if (weight && height && age) {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const ageNum = parseInt(age);
      
      // Calculate TMB based on profile
      let tmb = 0;
      
      if (profile === 'obeso') {
        tmb = TmbFormula.obeso[sex as 'M' | 'F'](weightNum, heightNum, ageNum);
      } else if (profile === 'atleta') {
        tmb = TmbFormula.atleta[sex as 'M' | 'F'](weightNum, heightNum, ageNum);
      } else {
        tmb = TmbFormula.default[sex as 'M' | 'F'](weightNum, heightNum, ageNum);
      }
      
      // Get activity factor
      const fa = activityFactors[activityLevel as keyof typeof activityFactors];
      
      // Calculate GET
      const get = tmb * fa;
      
      // Calculate macros
      const macros = calculateMacros(get, objective);
      
      setResults({
        tmb: Math.round(tmb),
        fa,
        get: Math.round(get),
        macros
      });
    }
  }, [formData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const consultationData = {
      ...formData,
      ...results
    };
    
    console.log('Consultation data:', consultationData);
    
    toast({
      title: "Consulta salva com sucesso",
      description: "Os resultados foram calculados e estão prontos para gerar um plano alimentar.",
    });
    
    // Navigate to meal plan generation
    navigate('/meal-plan-generator', { state: { consultation: consultationData } });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-nutri-blue">Nova Consulta</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="nutri-card shadow-lg border-none">
              <CardHeader>
                <CardTitle>Dados da Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)*</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.1"
                      min="30"
                      max="300"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)*</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="1"
                      min="100"
                      max="250"
                      value={formData.height}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade (anos)*</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      step="1"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sexo*</Label>
                    <RadioGroup 
                      value={formData.sex} 
                      onValueChange={(value) => handleSelectChange('sex', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="M" id="sex-m" />
                        <Label htmlFor="sex-m">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="F" id="sex-f" />
                        <Label htmlFor="sex-f">Feminino</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="objective">Objetivo*</Label>
                    <Select 
                      value={formData.objective} 
                      onValueChange={(value) => handleSelectChange('objective', value)}
                    >
                      <SelectTrigger id="objective">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                        <SelectItem value="manutenção">Manutenção</SelectItem>
                        <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Perfil*</Label>
                    <RadioGroup 
                      value={formData.profile} 
                      onValueChange={(value) => handleSelectChange('profile', value)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="magro" id="profile-magro" />
                        <Label htmlFor="profile-magro">Magro</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="obeso" id="profile-obeso" />
                        <Label htmlFor="profile-obeso">Obeso</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="atleta" id="profile-atleta" />
                        <Label htmlFor="profile-atleta">Atleta</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Nível de Atividade*</Label>
                    <Select 
                      value={formData.activityLevel} 
                      onValueChange={(value) => handleSelectChange('activityLevel', value)}
                    >
                      <SelectTrigger id="activityLevel">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentário">Sedentário</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-nutri-green hover:bg-nutri-green-dark"
                    >
                      Gerar Plano Alimentar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="nutri-card shadow-lg border-none">
              <CardHeader>
                <CardTitle>Resultados do Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-nutri-gray-light rounded-xl p-4 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Taxa Metabólica Basal</h3>
                    <p className="text-3xl font-bold text-nutri-blue">{results.tmb}</p>
                    <p className="text-sm text-gray-500">kcal/dia</p>
                  </div>
                  
                  <div className="bg-nutri-gray-light rounded-xl p-4 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Fator de Atividade</h3>
                    <p className="text-3xl font-bold text-nutri-green">{results.fa}</p>
                  </div>
                  
                  <div className="bg-nutri-gray-light rounded-xl p-4 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Gasto Energético Total</h3>
                    <p className="text-3xl font-bold text-purple-600">{results.get}</p>
                    <p className="text-sm text-gray-500">kcal/dia</p>
                  </div>
                </div>
                
                <h3 className="font-medium text-lg mb-4">Distribuição de Macronutrientes</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Proteínas</span>
                      <span className="font-medium">{results.macros.protein}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-nutri-blue h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (results.macros.protein * 100) / (results.macros.protein + results.macros.carbs + results.macros.fat))}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((results.macros.protein * 4 * 100) / results.get)}% do total de calorias
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Carboidratos</span>
                      <span className="font-medium">{results.macros.carbs}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-nutri-green h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (results.macros.carbs * 100) / (results.macros.protein + results.macros.carbs + results.macros.fat))}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((results.macros.carbs * 4 * 100) / results.get)}% do total de calorias
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Gorduras</span>
                      <span className="font-medium">{results.macros.fat}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-amber-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (results.macros.fat * 100) / (results.macros.protein + results.macros.carbs + results.macros.fat))}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((results.macros.fat * 9 * 100) / results.get)}% do total de calorias
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;
