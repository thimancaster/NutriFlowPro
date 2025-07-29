
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useToast } from '@/hooks/use-toast';
import { Calculator, TrendingUp, History } from 'lucide-react';
import { PatientHistoryData } from '@/types/meal';

interface AnthropometryStepProps {
  onCalculationsComplete?: () => void;
}

const AnthropometryStep: React.FC<AnthropometryStepProps> = ({ onCalculationsComplete }) => {
  const { 
    consultationData, 
    updateConsultationData, 
    patientHistoryData 
  } = useConsultationData();
  
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    bodyFat: '',
    goal: 'manutenção',
    activityLevel: 'moderado'
  });

  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (consultationData) {
      setFormData({
        weight: consultationData.weight?.toString() || '',
        height: consultationData.height?.toString() || '',
        bodyFat: '',
        goal: consultationData.objective || 'manutenção',
        activityLevel: consultationData.activity_level || 'moderado'
      });
    }
  }, [consultationData]);

  // Get last measurement safely
  const lastMeasurement = patientHistoryData?.lastMeasurement;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const getActivityMultiplier = (level: string) => {
    const multipliers: Record<string, number> = {
      'sedentario': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725,
      'muito_intenso': 1.9
    };
    return multipliers[level] || 1.55;
  };

  const getGoalAdjustment = (goal: string) => {
    const adjustments: Record<string, number> = {
      'emagrecimento': -300,
      'manutenção': 0,
      'hipertrofia': 300
    };
    return adjustments[goal] || 0;
  };

  const handleCalculate = () => {
    if (!consultationData) return;

    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = consultationData.age || 0;
    const gender = consultationData.gender || 'male';

    if (!weight || !height || !age) {
      toast({
        title: "Dados incompletos",
        description: "Preencha peso, altura e idade.",
        variant: "destructive"
      });
      return;
    }

    const bmr = calculateBMR(weight, height, age, gender);
    const activityMultiplier = getActivityMultiplier(formData.activityLevel);
    const tdee = bmr * activityMultiplier;
    const adjustment = getGoalAdjustment(formData.goal);
    const finalCalories = tdee + adjustment;

    // Calculate macros (example distribution)
    const protein = (finalCalories * 0.25) / 4; // 25% protein
    const carbs = (finalCalories * 0.45) / 4; // 45% carbs  
    const fat = (finalCalories * 0.30) / 9; // 30% fat

    const calculationResults = {
      bmr: Math.round(bmr),
      get: Math.round(tdee),
      vet: Math.round(finalCalories),
      adjustment,
      macros: {
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat)
      }
    };

    setResults(calculationResults);

    // Update consultation data
    updateConsultationData({
      weight,
      height,
      bmr: calculationResults.bmr,
      protein: calculationResults.macros.protein,
      carbs: calculationResults.macros.carbs,
      fats: calculationResults.macros.fat,
      totalCalories: calculationResults.vet,
      results: calculationResults,
      goal: formData.goal,
      activity_level: formData.activityLevel
    });

    toast({
      title: "Cálculos realizados",
      description: "Valores nutricionais calculados com sucesso!",
    });

    onCalculationsComplete?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-nutri-green" />
          Avaliação Antropométrica
        </CardTitle>
        
        {lastMeasurement && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-1 text-sm text-blue-700 mb-1">
              <History className="h-4 w-4" />
              Última medição ({new Date(lastMeasurement.date).toLocaleDateString('pt-BR')})
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Peso: {lastMeasurement.weight}kg</div>
              <div>Altura: {lastMeasurement.height}cm</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Peso atual (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="Ex: 70.5"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              step="0.1"
              value={formData.height}
              onChange={handleInputChange}
              placeholder="Ex: 170"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bodyFat">% Gordura Corporal (opcional)</Label>
            <Input
              id="bodyFat"
              name="bodyFat"
              type="number"
              step="0.1"
              value={formData.bodyFat}
              onChange={handleInputChange}
              placeholder="Ex: 15"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal">Objetivo</Label>
            <Select 
              value={formData.goal} 
              onValueChange={(value) => handleSelectChange('goal', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                <SelectItem value="manutenção">Manutenção</SelectItem>
                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="activityLevel">Nível de Atividade Física</Label>
            <Select 
              value={formData.activityLevel} 
              onValueChange={(value) => handleSelectChange('activityLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
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
        </div>

        {results && (
          <div className="mt-6 p-4 bg-nutri-light rounded-lg">
            <h3 className="font-semibold text-nutri-green mb-3">Resultados dos Cálculos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">TMB (Metabolismo Basal)</div>
                <div className="text-lg font-semibold">{results.bmr} kcal</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">GET (Gasto Energético Total)</div>
                <div className="text-lg font-semibold">{results.get} kcal</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">VET (Valor Energético Total)</div>
                <div className="text-lg font-semibold text-nutri-green">{results.vet} kcal</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Distribuição de Macronutrientes</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{results.macros.protein}g</div>
                  <div className="text-xs text-gray-500">Proteína</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{results.macros.carbs}g</div>
                  <div className="text-xs text-gray-500">Carboidrato</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{results.macros.fat}g</div>
                  <div className="text-xs text-gray-500">Gordura</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {patientHistoryData?.anthropometryHistory && patientHistoryData.anthropometryHistory.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Histórico Antropométrico</h4>
            <div className="space-y-2">
              {patientHistoryData.anthropometryHistory.slice(0, 3).map((record, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                  <span>{record.weight}kg | {record.height}cm | IMC: {record.bmi.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleCalculate}
          className="bg-nutri-green hover:bg-nutri-green-dark w-full"
        >
          <Calculator className="mr-2 h-4 w-4" />
          Calcular Valores Nutricionais
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnthropometryStep;
