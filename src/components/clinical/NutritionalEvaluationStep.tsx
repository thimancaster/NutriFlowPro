
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, Activity, Target, Zap } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useCalculator } from '@/hooks/useCalculator';
import { ActivityLevel, Objective } from '@/types/consultation';
import {
  mapActivityLevelToNew,
  mapObjectiveToNew,
  mapGenderToNew
} from '@/utils/nutrition/typeMapping';

const NutritionalEvaluationStep: React.FC = () => {
  const { consultationData, selectedPatient, updateConsultationData } = useConsultationData();
  const { 
    formData, 
    updateFormData, 
    calculate, 
    results, 
    isCalculating, 
    error,
    hasActivePatient 
  } = useCalculator();

  // Update form when consultation data changes or patient changes
  useEffect(() => {
    if (consultationData) {
      updateFormData({
        weight: consultationData.weight || formData.weight,
        height: consultationData.height || formData.height,
        age: consultationData.age || formData.age,
        gender: mapGenderToNew(consultationData.gender === 'male' ? 'M' : 'F'),
        activityLevel: mapActivityLevelToNew((consultationData.activity_level || 'moderado') as ActivityLevel),
        objective: mapObjectiveToNew((consultationData.objective || 'manutenção') as Objective),
      });
    }
  }, [consultationData]);

  const handleInputChange = (field: string, value: string) => {
    const numericFields = ['weight', 'height', 'age'];
    const finalValue = numericFields.includes(field) ? parseFloat(value) || 0 : value;
    updateFormData({ [field]: finalValue });
  };

  const handleCalculate = async () => {
    const result = await calculate();

    if (result) {
      // Update consultation data with calculated results
      updateConsultationData({
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        gender: formData.gender === 'M' ? 'male' : 'female',
        activity_level: formData.activityLevel,
        objective: formData.objective,
        totalCalories: result.vet,
        protein: result.macros.protein.grams,
        carbs: result.macros.carbs.grams,
        fats: result.macros.fat.grams,
        results: {
          bmr: result.tmb.value, // Extract numeric value
          get: result.get,
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
  };

  const isFormValid = formData.weight > 0 && formData.height > 0 && formData.age > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-nutri-blue" />
            Avaliação Nutricional
            {hasActivePatient && (
              <Badge variant="outline" className="ml-auto">
                Paciente Ativo
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Info Display */}
          {selectedPatient && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Paciente: {selectedPatient.name}</h3>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {selectedPatient.birth_date && (
                  <span>Idade: {new Date().getFullYear() - new Date(selectedPatient.birth_date).getFullYear()} anos</span>
                )}
                {selectedPatient.gender && (
                  <span>Sexo: {selectedPatient.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                )}
              </div>
            </div>
          )}

          {/* Anthropometric Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Ex: 70.5"
              />
            </div>
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height || ''}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="Ex: 175"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Ex: 30"
              />
            </div>
          </div>

          {/* Activity Level and Objective */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activity">Nível de Atividade</Label>
              <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário</SelectItem>
                  <SelectItem value="leve">Atividade Leve</SelectItem>
                  <SelectItem value="moderado">Atividade Moderada</SelectItem>
                  <SelectItem value="muito_ativo">Atividade Intensa</SelectItem>
                  <SelectItem value="extremamente_ativo">Muito Intenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="objective">Objetivo</Label>
              <Select value={formData.objective} onValueChange={(value) => handleInputChange('objective', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculate Button */}
          <Button 
            onClick={handleCalculate}
            disabled={!isFormValid || isCalculating}
            className="w-full bg-nutri-blue hover:bg-nutri-blue-dark"
          >
            {isCalculating ? 'Calculando...' : 'Calcular Necessidades Nutricionais'}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-nutri-green" />
                Resultados da Avaliação
              </h3>
              
              {/* Energy Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">TMB</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {results.tmb.value}
                    </div>
                    <div className="text-xs text-muted-foreground">kcal/dia</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">GET</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results.get}
                    </div>
                    <div className="text-xs text-muted-foreground">kcal/dia</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-nutri-green" />
                      <span className="text-sm font-medium">VET</span>
                    </div>
                    <div className="text-2xl font-bold text-nutri-green">
                      {results.vet}
                    </div>
                    <div className="text-xs text-muted-foreground">kcal/dia</div>
                  </CardContent>
                </Card>
              </div>

              {/* Macronutrients */}
              <div className="space-y-3">
                <h4 className="font-medium">Distribuição de Macronutrientes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Proteínas</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100">
                        {results.macros.protein.grams}g
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({results.macros.protein.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Carboidratos</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100">
                        {results.macros.carbs.grams}g
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({results.macros.carbs.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Gorduras</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-yellow-100">
                        {results.macros.fat.grams}g
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({results.macros.fat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Proteína por kg</span>
                    <Badge variant="outline" className="bg-purple-100">
                      {results.proteinPerKg.toFixed(2)}g/kg
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionalEvaluationStep;
