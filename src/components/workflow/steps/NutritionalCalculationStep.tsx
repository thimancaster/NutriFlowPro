import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, Activity, Target, Zap } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useConsolidatedNutrition } from '@/hooks/useConsolidatedNutrition';
import { 
  mapActivityLevelToNew,
  mapObjectiveToNew,
  mapProfileToNew 
} from '@/utils/nutrition/typeMapping';

interface NutritionalCalculationStepProps {
  onCalculationComplete: () => void;
}

export const NutritionalCalculationStep: React.FC<NutritionalCalculationStepProps> = ({
  onCalculationComplete
}) => {
  const { consultationData, updateConsultationData } = useConsultationData();
  const { activePatient } = usePatient();
  const { calculateNutrition, results, isCalculating } = useConsolidatedNutrition();
  
  const [activityLevel, setActivityLevel] = useState('moderado');
  const [objective, setObjective] = useState('manutenção');
  const [profile, setProfile] = useState('eutrofico');

  // Calcular automaticamente quando dados estão completos
  useEffect(() => {
    if (consultationData?.weight && 
        consultationData?.height && 
        consultationData?.age && 
        activePatient?.gender) {
      performCalculation();
    }
  }, [consultationData?.weight, consultationData?.height, consultationData?.age, 
      activePatient?.gender, activityLevel, objective, profile]);

  const performCalculation = async () => {
    if (!consultationData?.weight || 
        !consultationData?.height || 
        !consultationData?.age || 
        !activePatient?.gender) {
      return;
    }

    try {
      const calculationParams = {
        weight: consultationData.weight,
        height: consultationData.height,
        age: consultationData.age,
        gender: activePatient.gender === 'male' ? 'M' as const : 'F' as const,
        activityLevel: mapActivityLevelToNew(activityLevel as any),
        objective: mapObjectiveToNew(objective as any),
        profile: mapProfileToNew(profile as any)
      };

      const result = await calculateNutrition(calculationParams);
      
      if (result) {
        // Salvar resultados na consulta - incluindo 'get' obrigatório
        await updateConsultationData({
          bmr: result.tmb.value,
          totalCalories: result.vet,
          protein: result.macros.protein.grams,
          carbs: result.macros.carbs.grams,
          fats: result.macros.fat.grams,
          activity_level: activityLevel,
          objective: objective,
          results: {
            bmr: result.tmb.value,
            get: result.get, // Adicionando propriedade obrigatória
            vet: result.vet,
            adjustment: result.adjustment,
            macros: {
              protein: result.macros.protein.grams,
              carbs: result.macros.carbs.grams,
              fat: result.macros.fat.grams
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro no cálculo nutricional:', error);
    }
  };

  const handleCompleteStep = () => {
    if (results) {
      onCalculationComplete();
    }
  };

  const activityOptions = [
    { value: 'sedentario', label: 'Sedentário (1.2)', description: 'Pouco ou nenhum exercício' },
    { value: 'leve', label: 'Levemente Ativo (1.375)', description: 'Exercício leve 1-3 dias/semana' },
    { value: 'moderado', label: 'Moderadamente Ativo (1.55)', description: 'Exercício moderado 3-5 dias/semana' },
    { value: 'intenso', label: 'Muito Ativo (1.725)', description: 'Exercício intenso 6-7 dias/semana' },
    { value: 'muito_intenso', label: 'Extremamente Ativo (1.9)', description: 'Exercício muito intenso, trabalho físico' }
  ];

  const objectiveOptions = [
    { value: 'manutenção', label: 'Manutenção', description: 'Manter peso atual' },
    { value: 'emagrecimento', label: 'Emagrecimento', description: 'Déficit de 500 kcal' },
    { value: 'hipertrofia', label: 'Hipertrofia', description: 'Superávit de 400 kcal' }
  ];

  const profileOptions = [
    { value: 'eutrofico', label: 'Eutrófico', description: 'Peso normal (Harris-Benedict)' },
    { value: 'sobrepeso_obesidade', label: 'Sobrepeso/Obesidade', description: 'IMC ≥ 25 (Mifflin-St Jeor)' },
    { value: 'atleta', label: 'Atleta', description: 'Alto nível de atividade física' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Cálculos Nutricionais</h2>
        <p className="text-muted-foreground">
          Cálculo preciso de necessidades energéticas e distribuição de macronutrientes
        </p>
      </div>

      {/* Dados do Paciente */}
      {activePatient && consultationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados para Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="text-2xl font-bold">{consultationData.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Altura</p>
                <p className="text-2xl font-bold">{consultationData.height} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="text-2xl font-bold">{consultationData.age} anos</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sexo</p>
                <p className="text-2xl font-bold">
                  {activePatient.gender === 'male' ? 'M' : 'F'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parâmetros de Cálculo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              Nível de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {activityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o objetivo" />
              </SelectTrigger>
              <SelectContent>
                {objectiveOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5" />
              Perfil Corporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                {profileOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Resultados */}
      {results && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Calculator className="h-5 w-5" />
              Resultados dos Cálculos
              <Badge className="bg-green-600">
                Fórmula: {results.tmb.formula === 'harris_benedict' ? 'Harris-Benedict' : 'Mifflin-St Jeor'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Valores Energéticos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">TMB</p>
                <p className="text-2xl font-bold text-blue-600">{results.tmb.value} kcal</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">GEA</p>
                <p className="text-2xl font-bold text-orange-600">{results.gea} kcal</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">VET</p>
                <p className="text-2xl font-bold text-green-600">{results.vet} kcal</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Ajuste</p>
                <p className="text-2xl font-bold text-purple-600">
                  {results.adjustment > 0 ? '+' : ''}{results.adjustment} kcal
                </p>
              </div>
            </div>

            {/* Macronutrientes */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Proteínas</p>
                <p className="text-xl font-bold text-red-600">
                  {results.macros.protein.grams}g
                </p>
                <p className="text-sm text-muted-foreground">
                  {results.macros.protein.kcal} kcal ({results.macros.protein.percentage}%)
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Carboidratos</p>
                <p className="text-xl font-bold text-yellow-600">
                  {results.macros.carbs.grams}g
                </p>
                <p className="text-sm text-muted-foreground">
                  {results.macros.carbs.kcal} kcal ({results.macros.carbs.percentage}%)
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Gorduras</p>
                <p className="text-xl font-bold text-blue-600">
                  {results.macros.fat.grams}g
                </p>
                <p className="text-sm text-muted-foreground">
                  {results.macros.fat.kcal} kcal ({results.macros.fat.percentage}%)
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleCompleteStep}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Prosseguir para Plano Alimentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isCalculating && (
        <div className="text-center py-8">
          <p>Realizando cálculos nutricionais...</p>
        </div>
      )}
    </div>
  );
};
