
/**
 * Etapa 1: Cálculo Energético (TMB, GET, VET)
 * Interface sequencial seguindo o workflow definido
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, User, Activity, Target, ArrowRight } from 'lucide-react';
import { useNutritionWorkflow } from '@/contexts/NutritionWorkflowContext';
import { PROFILE_TYPES, ACTIVITY_FACTORS, OBJECTIVE_TYPES } from '@/utils/calculations';

export const EnergyCalculationStep: React.FC = () => {
  const { 
    profile, 
    energyCalculation, 
    setProfile, 
    calculateEnergy, 
    setCurrentStep, 
    errors,
    canProceedToStep2 
  } = useNutritionWorkflow();

  // Local state for form inputs
  const [formData, setFormData] = useState({
    weight: profile?.weight || 0,
    height: profile?.height || 0,
    age: profile?.age || 0,
    gender: profile?.gender || 'F',
    profileType: profile?.profileType || 'eutrofico',
    activityFactor: energyCalculation?.activityFactor || 1.55,
    objectiveType: energyCalculation?.objectiveType || 'manutencao',
    calorieAdjustment: energyCalculation?.calorieAdjustment || 0
  });

  const [calculatedValues, setCalculatedValues] = useState({
    tmb: 0,
    get: 0,
    vet: 0
  });

  // Update profile when form changes
  const handleProfileUpdate = () => {
    if (formData.weight > 0 && formData.height > 0 && formData.age > 0) {
      setProfile({
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        gender: formData.gender as 'M' | 'F',
        profileType: formData.profileType as any
      });
    }
  };

  // Calculate energy when profile or activity data changes
  const handleEnergyCalculation = () => {
    if (formData.weight > 0 && formData.height > 0 && formData.age > 0) {
      handleProfileUpdate();
      calculateEnergy({
        activityFactor: formData.activityFactor,
        objectiveType: formData.objectiveType,
        calorieAdjustment: formData.calorieAdjustment
      });
    }
  };

  // Update calculated values when energy calculation changes
  useEffect(() => {
    if (energyCalculation) {
      setCalculatedValues({
        tmb: energyCalculation.tmb,
        get: energyCalculation.get,
        vet: energyCalculation.vet
      });
    }
  }, [energyCalculation]);

  const handleProceedToStep2 = () => {
    if (canProceedToStep2) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Etapa 1: Cálculo Energético
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 1.1 Seleção do Perfil e Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              1.1. Perfil do Usuário
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profileType">Perfil Corporal *</Label>
                <Select 
                  value={formData.profileType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, profileType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eutrofico">Eutrófico/Magro (Harris-Benedict)</SelectItem>
                    <SelectItem value="sobrepeso_obesidade">Sobrepeso/Obesidade (Mifflin-St Jeor)</SelectItem>
                    <SelectItem value="atleta">Atleta/Musculoso (Tinsley)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="gender">Gênero *</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="M">Masculino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="weight">Peso (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  placeholder="70"
                  min="1"
                  max="500"
                />
              </div>
              
              {formData.profileType !== 'atleta' && (
                <>
                  <div>
                    <Label htmlFor="height">Altura (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                      placeholder="170"
                      min="100"
                      max="250"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="age">Idade (anos) *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      placeholder="30"
                      min="1"
                      max="120"
                    />
                  </div>
                </>
              )}
            </div>

            {formData.profileType === 'atleta' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Perfil Atleta:</strong> Para este perfil, apenas o peso é necessário. 
                  A fórmula de Tinsley (TMB = 22 × peso) será aplicada independente do gênero.
                </p>
              </div>
            )}
          </div>

          {/* 1.2 Fator de Atividade */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              1.2. Nível de Atividade Física
            </h3>
            
            <div>
              <Label htmlFor="activityFactor">Fator de Atividade *</Label>
              <Select 
                value={formData.activityFactor.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, activityFactor: parseFloat(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.2">1.2 - Sedentário</SelectItem>
                  <SelectItem value="1.375">1.375 - Atividade Leve</SelectItem>
                  <SelectItem value="1.55">1.55 - Atividade Moderada</SelectItem>
                  <SelectItem value="1.725">1.725 - Atividade Intensa</SelectItem>
                  <SelectItem value="1.9">1.9 - Atividade Muito Intensa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 1.3 Objetivo e Ajuste Calórico */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              1.3. Objetivo e Ajuste Calórico
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="objectiveType">Objetivo *</Label>
                <Select 
                  value={formData.objectiveType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, objectiveType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manutencao">Manutenção de Peso</SelectItem>
                    <SelectItem value="hipertrofia">Hipertrofia (Ganho de Massa)</SelectItem>
                    <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.objectiveType !== 'manutencao' && (
                <div>
                  <Label htmlFor="calorieAdjustment">
                    {formData.objectiveType === 'hipertrofia' ? 'Superávit Calórico' : 'Déficit Calórico'} (kcal)
                  </Label>
                  <Input
                    id="calorieAdjustment"
                    type="number"
                    value={formData.calorieAdjustment || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, calorieAdjustment: parseFloat(e.target.value) || 0 }))}
                    placeholder={formData.objectiveType === 'hipertrofia' ? '500' : '400'}
                    min="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botão de Cálculo */}
          <Button 
            onClick={handleEnergyCalculation} 
            className="w-full"
            disabled={!formData.weight || (formData.profileType !== 'atleta' && (!formData.height || !formData.age))}
          >
            Calcular TMB, GET e VET
          </Button>

          {/* Display de Erros */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Erros encontrados:</h4>
              <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados dos Cálculos */}
      {energyCalculation && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados do Cálculo Energético</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{calculatedValues.tmb}</div>
                <div className="text-sm text-blue-800">TMB (kcal/dia)</div>
                <div className="text-xs text-gray-600 mt-1">Taxa Metabólica Basal</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{calculatedValues.get}</div>
                <div className="text-sm text-green-800">GET (kcal/dia)</div>
                <div className="text-xs text-gray-600 mt-1">Gasto Energético Total</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{calculatedValues.vet}</div>
                <div className="text-sm text-purple-800">VET (kcal/dia)</div>
                <div className="text-xs text-gray-600 mt-1">Meta Calórica Final</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Perfil: <Badge variant="outline">{formData.profileType}</Badge></p>
                <p>Fator Atividade: {formData.activityFactor}</p>
                {formData.calorieAdjustment > 0 && (
                  <p>Ajuste: {formData.objectiveType === 'hipertrofia' ? '+' : '-'}{formData.calorieAdjustment} kcal</p>
                )}
              </div>
              
              <Button 
                onClick={handleProceedToStep2}
                disabled={!canProceedToStep2}
                className="flex items-center gap-2"
              >
                Próxima Etapa: Macronutrientes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
