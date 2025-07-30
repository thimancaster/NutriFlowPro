
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, Save, ArrowRight } from 'lucide-react';
import { useUnifiedCalculator } from '@/hooks/useUnifiedCalculator';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useToast } from '@/hooks/use-toast';

interface UnifiedCalculatorStepProps {
  onComplete: () => void;
}

type Gender = 'male' | 'female' | 'other';

const UnifiedCalculatorStep: React.FC<UnifiedCalculatorStepProps> = ({ onComplete }) => {
  const { activePatient } = usePatient();
  const { calculatorData, isCalculating, isSaving, calculateNutrition, saveCalculation } = useUnifiedCalculator();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: activePatient?.age?.toString() || '',
    gender: (activePatient?.gender || 'male') as Gender,
    activityLevel: 'moderado',
    objective: 'manutencao'
  });

  const [result, setResult] = useState<any>(null);

  const handleCalculate = async () => {
    if (!formData.weight || !formData.height || !formData.age) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha peso, altura e idade',
        variant: 'destructive'
      });
      return;
    }

    const calculationResult = await calculateNutrition({
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      age: parseInt(formData.age),
      gender: formData.gender as 'male' | 'female',
      activityLevel: formData.activityLevel,
      objective: formData.objective
    });

    if (calculationResult) {
      setResult(calculationResult);
    }
  };

  const handleSaveAndProceed = async () => {
    const calculationId = await saveCalculation();
    if (calculationId) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cálculo Nutricional Unificado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="70"
              />
            </div>
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                placeholder="170"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Sexo</Label>
              <Select value={formData.gender} onValueChange={(value: Gender) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nível de Atividade</Label>
              <Select value={formData.activityLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}>
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
            <div>
              <Label>Objetivo</Label>
              <Select value={formData.objective} onValueChange={(value) => setFormData(prev => ({ ...prev, objective: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perda_peso">Perda de Peso</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="ganho_peso">Ganho de Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleCalculate} 
            disabled={isCalculating}
            className="w-full"
          >
            {isCalculating ? 'Calculando...' : 'Calcular'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados do Cálculo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.bmr}</div>
                <div className="text-sm text-muted-foreground">TMB (kcal)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.tdee}</div>
                <div className="text-sm text-muted-foreground">VET (kcal)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{result.macros.protein.grams}g</div>
                <div className="text-sm text-muted-foreground">Proteína</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{result.macros.carbs.grams}g</div>
                <div className="text-sm text-muted-foreground">Carboidratos</div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                onClick={handleSaveAndProceed}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? 'Salvando...' : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar e Continuar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedCalculatorStep;
