
/**
 * Etapa 2: Definição e Distribuição dos Macronutrientes
 * Interface reativa com cálculo automático de carboidratos
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PieChart, ArrowLeft, ArrowRight, Calculator } from 'lucide-react';
import { useNutritionWorkflow } from '@/contexts/NutritionWorkflowContext';
import { DEFAULT_VALUES } from '@/utils/calculations';

export const MacroDefinitionStep: React.FC = () => {
  const { 
    profile,
    energyCalculation, 
    macroDefinition, 
    defineMacros, 
    setCurrentStep, 
    errors,
    canProceedToStep3 
  } = useNutritionWorkflow();

  // Local state for macro inputs
  const [macroInputs, setMacroInputs] = useState({
    proteinPerKg: macroDefinition?.proteinPerKg || DEFAULT_VALUES.PROTEIN_PER_KG[profile?.profileType || 'eutrofico'] || 1.2,
    lipidPerKg: macroDefinition?.lipidPerKg || DEFAULT_VALUES.LIPID_PER_KG[profile?.profileType || 'eutrofico'] || 0.8
  });

  // State for meal distribution
  const [mealPercentages, setMealPercentages] = useState<number[]>(
    macroDefinition?.mealPercentages || [20, 20, 20, 20, 20] // 5 refeições padrão
  );

  const [calculatedMacros, setCalculatedMacros] = useState(null);

  // Calculate macros when inputs change
  useEffect(() => {
    if (profile && energyCalculation && macroInputs.proteinPerKg >= 0 && macroInputs.lipidPerKg >= 0) {
      defineMacros({
        proteinPerKg: macroInputs.proteinPerKg,
        lipidPerKg: macroInputs.lipidPerKg,
        mealPercentages: mealPercentages
      });
    }
  }, [macroInputs, mealPercentages, profile, energyCalculation, defineMacros]);

  // Update calculated macros when macro definition changes
  useEffect(() => {
    if (macroDefinition?.calculatedMacros) {
      setCalculatedMacros(macroDefinition.calculatedMacros);
    }
  }, [macroDefinition]);

  const handleInputChange = (field: 'proteinPerKg' | 'lipidPerKg', value: number) => {
    setMacroInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleMealPercentageChange = (index: number, value: number) => {
    const newPercentages = [...mealPercentages];
    newPercentages[index] = value;
    setMealPercentages(newPercentages);
  };

  const addMeal = () => {
    if (mealPercentages.length < 6) {
      setMealPercentages([...mealPercentages, 0]);
    }
  };

  const removeMeal = (index: number) => {
    if (mealPercentages.length > 1) {
      setMealPercentages(mealPercentages.filter((_, i) => i !== index));
    }
  };

  const distributeMealsEqually = () => {
    const equalPercentage = Math.round(100 / mealPercentages.length);
    const newPercentages = mealPercentages.map(() => equalPercentage);
    
    // Ajustar o último para garantir soma = 100%
    const sum = newPercentages.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      newPercentages[newPercentages.length - 1] += (100 - sum);
    }
    
    setMealPercentages(newPercentages);
  };

  const totalPercentage = mealPercentages.reduce((sum, p) => sum + p, 0);
  const isValidDistribution = Math.abs(totalPercentage - 100) < 0.1;

  if (!profile || !energyCalculation) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Complete a Etapa 1 primeiro</p>
          <Button onClick={() => setCurrentStep(1)} className="mt-4">
            Voltar para Etapa 1
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Etapa 2: Definição dos Macronutrientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumo da Etapa Anterior */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Resumo da Etapa 1:</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>Peso: {profile.weight} kg</span>
              <span>VET: {energyCalculation.vet} kcal/dia</span>
              <span>Perfil: {profile.profileType}</span>
            </div>
          </div>

          {/* 2.1 Inputs do Usuário */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              2.1. Definição de Proteína e Lipídio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="proteinPerKg">Proteína (g/kg) *</Label>
                <Input
                  id="proteinPerKg"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={macroInputs.proteinPerKg || ''}
                  onChange={(e) => handleInputChange('proteinPerKg', parseFloat(e.target.value) || 0)}
                  placeholder="1.8"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado para {profile.profileType}: {DEFAULT_VALUES.PROTEIN_PER_KG[profile.profileType]} g/kg
                </p>
              </div>
              
              <div>
                <Label htmlFor="lipidPerKg">Lipídio (g/kg) *</Label>
                <Input
                  id="lipidPerKg"
                  type="number"
                  step="0.1"
                  min="0"
                  max="3"
                  value={macroInputs.lipidPerKg || ''}
                  onChange={(e) => handleInputChange('lipidPerKg', parseFloat(e.target.value) || 0)}
                  placeholder="0.8"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado para {profile.profileType}: {DEFAULT_VALUES.LIPID_PER_KG[profile.profileType]} g/kg
                </p>
              </div>
            </div>
          </div>

          {/* Carboidratos Calculados Automaticamente */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Carboidratos (Calculado Automaticamente):</h4>
            <p className="text-sm text-yellow-700">
              Os carboidratos são calculados pela diferença: VET - (Proteína kcal + Lipídio kcal) ÷ 4
              <br />
              <strong>O campo de carboidratos não pode ser editado diretamente.</strong>
            </p>
          </div>

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

      {/* Resultados dos Macronutrientes */}
      {calculatedMacros && (
        <Card>
          <CardHeader>
            <CardTitle>Macronutrientes Calculados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{calculatedMacros.protein.grams}g</div>
                <div className="text-sm text-orange-800">Proteína</div>
                <div className="text-xs text-gray-600 mt-1">
                  {calculatedMacros.protein.kcal} kcal ({calculatedMacros.protein.percentage}%)
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{calculatedMacros.carbohydrate.grams}g</div>
                <div className="text-sm text-purple-800">Carboidratos</div>
                <div className="text-xs text-gray-600 mt-1">
                  {calculatedMacros.carbohydrate.kcal} kcal ({calculatedMacros.carbohydrate.percentage}%)
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{calculatedMacros.lipid.grams}g</div>
                <div className="text-sm text-blue-800">Lipídios</div>
                <div className="text-xs text-gray-600 mt-1">
                  {calculatedMacros.lipid.kcal} kcal ({calculatedMacros.lipid.percentage}%)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2.2 Divisão Percentual por Refeição */}
      {calculatedMacros && (
        <Card>
          <CardHeader>
            <CardTitle>2.2. Distribuição por Refeições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addMeal}
                disabled={mealPercentages.length >= 6}
              >
                + Adicionar Refeição
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={distributeMealsEqually}
              >
                Distribuir Igualmente
              </Button>
            </div>

            <div className="space-y-3">
              {mealPercentages.map((percentage, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="font-medium min-w-[100px]">
                    Refeição {index + 1}:
                  </div>
                  <div className="flex-1 max-w-[120px]">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={percentage || ''}
                      onChange={(e) => handleMealPercentageChange(index, parseFloat(e.target.value) || 0)}
                      placeholder="20"
                    />
                  </div>
                  <div className="text-sm text-gray-600 min-w-[40px]">%</div>
                  {mealPercentages.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeMeal(index)}
                      className="text-red-600"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div className="text-sm">
                <span>Total: </span>
                <Badge variant={isValidDistribution ? "default" : "destructive"}>
                  {totalPercentage.toFixed(1)}%
                </Badge>
              </div>
              
              {!isValidDistribution && (
                <p className="text-sm text-red-600">
                  A soma deve totalizar 100%
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Etapa Anterior
        </Button>
        
        <Button 
          onClick={() => setCurrentStep(3)}
          disabled={!canProceedToStep3 || !isValidDistribution}
          className="flex items-center gap-2"
        >
          Próxima Etapa: Montagem das Refeições
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
