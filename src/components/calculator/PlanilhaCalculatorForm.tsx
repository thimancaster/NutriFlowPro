
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePlanilhaCalculator } from '@/hooks/usePlanilhaCalculator';
import type { CalculoPlanilhaInputs } from '@/utils/nutrition/planilhaCalculations';

const PlanilhaCalculatorForm: React.FC = () => {
  const { calculate, isCalculating, result, error } = usePlanilhaCalculator();
  
  const [formData, setFormData] = useState<CalculoPlanilhaInputs>({
    peso: 0,
    altura: 0,
    idade: 0,
    sexo: 'F',
    perfil_get: 'magro',
    superavit_deficit_calorico: 0
  });

  const handleInputChange = (field: keyof CalculoPlanilhaInputs, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    await calculate(formData);
  };

  const isFormValid = formData.peso > 0 && formData.altura > 0 && formData.idade > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora da Planilha Nutricional - Fase 1
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="peso">Peso (kg) *</Label>
              <Input
                id="peso"
                type="number"
                value={formData.peso || ''}
                onChange={(e) => handleInputChange('peso', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 70"
                min="20"
                max="300"
                step="0.1"
              />
            </div>
            
            <div>
              <Label htmlFor="altura">Altura (cm) *</Label>
              <Input
                id="altura"
                type="number"
                value={formData.altura || ''}
                onChange={(e) => handleInputChange('altura', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 170"
                min="100"
                max="250"
                step="0.1"
              />
            </div>
            
            <div>
              <Label htmlFor="idade">Idade (anos) *</Label>
              <Input
                id="idade"
                type="number"
                value={formData.idade || ''}
                onChange={(e) => handleInputChange('idade', parseInt(e.target.value) || 0)}
                placeholder="Ex: 30"
                min="1"
                max="120"
              />
            </div>
          </div>

          {/* Sexo */}
          <div>
            <Label>Sexo *</Label>
            <RadioGroup 
              value={formData.sexo} 
              onValueChange={(value) => handleInputChange('sexo', value as 'M' | 'F')}
              className="flex flex-row space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="M" id="male" />
                <Label htmlFor="male" className="cursor-pointer">Masculino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="F" id="female" />
                <Label htmlFor="female" className="cursor-pointer">Feminino</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Perfil GET */}
          <div>
            <Label htmlFor="perfil_get">Perfil GET (conforme planilha) *</Label>
            <Select 
              value={formData.perfil_get} 
              onValueChange={(value) => handleInputChange('perfil_get', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="magro">Magro (Harris-Benedict)</SelectItem>
                <SelectItem value="obeso_sobrepeso">Obeso/Sobrepeso (Mifflin-St Jeor)</SelectItem>
                <SelectItem value="atleta_musculoso">Atleta/Musculoso (24.8*peso+10)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Superávit/Déficit Calórico */}
          <div>
            <Label htmlFor="superavit_deficit">Superávit/Déficit Calórico (kcal)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="superavit_deficit"
                type="number"
                value={formData.superavit_deficit_calorico || ''}
                onChange={(e) => handleInputChange('superavit_deficit_calorico', parseFloat(e.target.value) || 0)}
                placeholder="0"
                step="50"
              />
              <div className="flex space-x-1 text-sm text-gray-500">
                {formData.superavit_deficit_calorico > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                {formData.superavit_deficit_calorico < 0 && <TrendingDown className="h-4 w-4 text-red-500" />}
                {formData.superavit_deficit_calorico === 0 && <Minus className="h-4 w-4 text-gray-500" />}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Positivo = Superávit (ganho), Negativo = Déficit (perda), Zero = Manutenção
            </p>
          </div>

          <Button 
            onClick={handleCalculate}
            disabled={isCalculating || !isFormValid}
            className="w-full"
            size="lg"
          >
            {isCalculating ? (
              <>
                <Calculator className="mr-2 h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calcular (Planilha)
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados do Cálculo (Planilha)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.tmb}</div>
                <div className="text-sm text-blue-800">TMB (kcal/dia)</div>
                <div className="text-xs text-gray-600 mt-1">Taxa Metabólica Basal</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.get}</div>
                <div className="text-sm text-green-800">GET (kcal/dia)</div>
                <div className="text-xs text-gray-600 mt-1">Gasto Energético Total</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{result.vet}</div>
                <div className="text-sm text-purple-800">VET (kcal/dia)</div>
                <div className="text-xs text-gray-600 mt-1">Valor Energético Total</div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800">Detalhes do Cálculo:</h4>
              <p className="text-sm text-gray-600">
                <strong>Perfil:</strong> {result.parametros_utilizados.perfil}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Fórmula TMB:</strong> {result.formula_aplicada}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Fator de Atividade:</strong> {result.parametros_utilizados.fa_valor}
              </p>
              {formData.superavit_deficit_calorico !== 0 && (
                <p className="text-sm text-gray-600">
                  <strong>Ajuste Calórico:</strong> {formData.superavit_deficit_calorico > 0 ? '+' : ''}{formData.superavit_deficit_calorico} kcal
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanilhaCalculatorForm;
