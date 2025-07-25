
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calculator, User, Activity, Target, ChefHat } from 'lucide-react';

interface NutritionalData {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: string;
  objective: string;
  bodyType: string;
  tmb: number;
  get: number;
  vet: number;
  protein: number;
  carbs: number;
  fats: number;
  proteinKcal: number;
  carbsKcal: number;
  fatsKcal: number;
  notes: string;
}

interface NutritionalEvaluationStepProps {
  data: NutritionalData;
  onDataChange: (data: NutritionalData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const NutritionalEvaluationStep: React.FC<NutritionalEvaluationStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
}) => {
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: keyof NutritionalData, value: string | number) => {
    // Ensure gender is properly typed
    if (field === 'gender' && typeof value === 'string') {
      onDataChange({
        ...data,
        [field]: value as 'male' | 'female'
      });
    } else {
      onDataChange({
        ...data,
        [field]: value
      });
    }
  };

  const calculateNutrition = () => {
    setIsCalculating(true);
    
    try {
      // TMB calculation using Harris-Benedict equation
      let tmb: number;
      if (data.gender === 'male') {
        tmb = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
      } else {
        tmb = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
      }

      // Activity factor
      const activityFactors: { [key: string]: number } = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extra_active: 1.9
      };

      const activityFactor = activityFactors[data.activityLevel] || 1.2;
      const get = tmb * activityFactor;

      // Objective adjustment
      let vet: number;
      switch (data.objective) {
        case 'weight_loss':
          vet = get * 0.8; // 20% deficit
          break;
        case 'weight_gain':
          vet = get * 1.2; // 20% surplus
          break;
        case 'maintenance':
        default:
          vet = get;
          break;
      }

      // Macronutrient distribution
      const proteinPercentage = 0.25; // 25% protein
      const carbsPercentage = 0.45; // 45% carbs
      const fatsPercentage = 0.30; // 30% fats

      const proteinKcal = vet * proteinPercentage;
      const carbsKcal = vet * carbsPercentage;
      const fatsKcal = vet * fatsPercentage;

      const proteinGrams = proteinKcal / 4; // 4 kcal per gram
      const carbsGrams = carbsKcal / 4; // 4 kcal per gram
      const fatsGrams = fatsKcal / 9; // 9 kcal per gram

      onDataChange({
        ...data,
        tmb: Math.round(tmb),
        get: Math.round(get),
        vet: Math.round(vet),
        protein: Math.round(proteinGrams),
        carbs: Math.round(carbsGrams),
        fats: Math.round(fatsGrams),
        proteinKcal: Math.round(proteinKcal),
        carbsKcal: Math.round(carbsKcal),
        fatsKcal: Math.round(fatsKcal)
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const isFormValid = () => {
    return data.weight > 0 && 
           data.height > 0 && 
           data.age > 0 && 
           data.gender && 
           data.activityLevel && 
           data.objective;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Antropométricos
          </CardTitle>
          <CardDescription>
            Insira os dados básicos para o cálculo nutricional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={data.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 70"
              />
            </div>
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={data.height || ''}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 170"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={data.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                placeholder="Ex: 30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Sexo</Label>
              <Select value={data.gender} onValueChange={(value: 'male' | 'female') => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="activity">Nível de Atividade</Label>
              <Select value={data.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentário</SelectItem>
                  <SelectItem value="lightly_active">Levemente ativo</SelectItem>
                  <SelectItem value="moderately_active">Moderadamente ativo</SelectItem>
                  <SelectItem value="very_active">Muito ativo</SelectItem>
                  <SelectItem value="extra_active">Extremamente ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="objective">Objetivo</Label>
              <Select value={data.objective} onValueChange={(value) => handleInputChange('objective', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Perda de peso</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="weight_gain">Ganho de peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bodyType">Biotipo</Label>
              <Select value={data.bodyType} onValueChange={(value) => handleInputChange('bodyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o biotipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ectomorph">Ectomorfo</SelectItem>
                  <SelectItem value="mesomorph">Mesomorfo</SelectItem>
                  <SelectItem value="endomorph">Endomorfo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={calculateNutrition}
              disabled={!isFormValid() || isCalculating}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {isCalculating ? 'Calculando...' : 'Calcular Necessidades'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {data.tmb > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Resultados dos Cálculos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.tmb}</div>
                <div className="text-sm text-gray-600">TMB (kcal)</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.get}</div>
                <div className="text-sm text-gray-600">GET (kcal)</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{data.vet}</div>
                <div className="text-sm text-gray-600">VET (kcal)</div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">{data.protein}g</div>
                <div className="text-sm text-gray-600">Proteína ({data.proteinKcal} kcal)</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">{data.carbs}g</div>
                <div className="text-sm text-gray-600">Carboidrato ({data.carbsKcal} kcal)</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{data.fats}g</div>
                <div className="text-sm text-gray-600">Gordura ({data.fatsKcal} kcal)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Observações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Adicione observações sobre a avaliação nutricional..."
            value={data.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button onClick={onNext} disabled={data.tmb === 0}>
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default NutritionalEvaluationStep;
