
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateComplete, CompleteCalculationInputs } from '@/utils/nutrition/completeCalculation';
import { GERFormula, GER_FORMULAS } from '@/types/gerFormulas';
import { ActivityLevel, Objective, Profile } from '@/types/consultation';

export const ENPCalculationValidator: React.FC = () => {
  const [inputs, setInputs] = useState<CompleteCalculationInputs>({
    weight: 70,
    height: 170,
    age: 30,
    sex: 'M',
    activityLevel: 'moderado' as ActivityLevel,
    objective: 'manutenção' as Objective,
    profile: 'eutrofico' as Profile,
    gerFormula: 'mifflin_st_jeor' as GERFormula,
    bodyFatPercentage: undefined
  });

  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    try {
      setError(null);
      const result = calculateComplete(inputs);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setResults(null);
    }
  };

  const handleInputChange = (field: keyof CompleteCalculationInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validador do Sistema de Cálculo ENP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={inputs.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={inputs.height}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={inputs.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="sex">Sexo</Label>
              <Select value={inputs.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bodyFat">% Gordura (opcional)</Label>
              <Input
                id="bodyFat"
                type="number"
                value={inputs.bodyFatPercentage || ''}
                onChange={(e) => handleInputChange('bodyFatPercentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Obrigatório para Katch-McArdle e Cunningham"
              />
            </div>
            <div>
              <Label htmlFor="gerFormula">Fórmula GER</Label>
              <Select value={inputs.gerFormula} onValueChange={(value) => handleInputChange('gerFormula', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(GER_FORMULAS).map((formula) => (
                    <SelectItem key={formula.id} value={formula.id}>
                      {formula.name}
                      {formula.requiresBodyFat && ' (Requer % Gordura)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            Calcular e Validar
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">Erro: {error}</p>
            </div>
          )}

          {results && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <h3 className="font-medium text-green-800">Resultados:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>GER ({results.gerFormulaName}): {results.ger} kcal</div>
                <div>GEA: {results.gea} kcal</div>
                <div>GET: {results.get} kcal</div>
                <div>Proteína: {results.macros.protein.grams}g ({results.proteinPerKg}g/kg)</div>
                <div>Carboidratos: {results.macros.carbs.grams}g</div>
                <div>Gorduras: {results.macros.fat.grams}g</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
