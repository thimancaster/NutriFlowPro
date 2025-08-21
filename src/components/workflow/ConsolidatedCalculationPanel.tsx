
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, Activity, Target, Zap } from 'lucide-react';
import { useConsolidatedNutrition, type ConsolidatedNutritionParams } from '@/hooks/useConsolidatedNutrition';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';

interface ConsolidatedCalculationPanelProps {
  patient: Patient;
  onCalculationComplete: (results: any) => void;
  autoCalculate?: boolean;
}

const ConsolidatedCalculationPanel: React.FC<ConsolidatedCalculationPanelProps> = ({
  patient,
  onCalculationComplete,
  autoCalculate = true
}) => {
  const { toast } = useToast();
  const {
    results,
    isCalculating,
    error,
    calculateNutrition,
    clearResults
  } = useConsolidatedNutrition();

  // Form state
  const [formData, setFormData] = useState<ConsolidatedNutritionParams>({
    weight: 70,
    height: 170,
    age: patient.birth_date ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear() : 30,
    gender: patient.gender === 'male' ? 'M' : 'F',
    activityLevel: 'moderado',
    objective: 'manutencao',
    profile: 'eutrofico'
  });

  const [isEditing, setIsEditing] = useState(!autoCalculate);

  // Auto-calculate when component mounts if autoCalculate is true
  useEffect(() => {
    if (autoCalculate && formData.weight && formData.height && formData.age) {
      handleCalculate();
    }
  }, [autoCalculate]);

  // Pass results to parent when calculation completes
  useEffect(() => {
    if (results) {
      onCalculationComplete({
        ...results,
        formData
      });
    }
  }, [results, onCalculationComplete, formData]);

  const handleCalculate = async () => {
    try {
      await calculateNutrition(formData);
    } catch (err: any) {
      toast({
        title: 'Erro no Cálculo',
        description: err.message || 'Erro ao calcular necessidades nutricionais',
        variant: 'destructive'
      });
    }
  };

  const updateField = (field: keyof ConsolidatedNutritionParams, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearResults(); // Clear results when data changes
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    await handleCalculate();
    setIsEditing(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cálculo Nutricional
          </div>
          <div className="flex items-center gap-2">
            {results && (
              <Badge variant="default">
                <Zap className="h-3 w-3 mr-1" />
                Calculado
              </Badge>
            )}
            {!isEditing && results && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                Editar
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input Form */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => updateField('weight', Number(e.target.value))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => updateField('height', Number(e.target.value))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => updateField('age', Number(e.target.value))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Sexo</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'M' | 'F') => updateField('gender', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activityLevel">Nível de Atividade</Label>
              <Select
                value={formData.activityLevel}
                onValueChange={(value: any) => updateField('activityLevel', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário</SelectItem>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="muito_ativo">Muito Ativo</SelectItem>
                  <SelectItem value="extremamente_ativo">Extremamente Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo</Label>
              <Select
                value={formData.objective}
                onValueChange={(value: any) => updateField('objective', value)}
                disabled={!isEditing}
              >
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
            <div className="space-y-2">
              <Label htmlFor="profile">Perfil</Label>
              <Select
                value={formData.profile}
                onValueChange={(value: any) => updateField('profile', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eutrofico">Eutrófico</SelectItem>
                  <SelectItem value="obeso_sobrepeso">Obeso/Sobrepeso</SelectItem>
                  <SelectItem value="atleta">Atleta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave}
                  disabled={isCalculating}
                  className="flex-1"
                >
                  {isCalculating ? 'Calculando...' : 'Calcular e Salvar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isCalculating}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleCalculate}
                disabled={isCalculating}
                variant="outline"
                className="flex-1"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {isCalculating ? 'Recalculando...' : 'Recalcular'}
              </Button>
            )}
          </div>

          {/* Results Display */}
          {results && (
            <div className="bg-accent/50 rounded-lg p-4 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Resultados do Cálculo
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{Math.round(results.tmb.value)}</p>
                  <p className="text-sm text-muted-foreground">TMB (kcal)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{Math.round(results.get)}</p>
                  <p className="text-sm text-muted-foreground">GET (kcal)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{Math.round(results.vet)}</p>
                  <p className="text-sm text-muted-foreground">VET (kcal)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{results.formulaUsed}</p>
                  <p className="text-sm text-muted-foreground">Fórmula</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-lg font-semibold">{Math.round(results.macros.protein.grams)}g</p>
                  <p className="text-sm text-muted-foreground">Proteína</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-lg font-semibold">{Math.round(results.macros.carbs.grams)}g</p>
                  <p className="text-sm text-muted-foreground">Carboidratos</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-lg font-semibold">{Math.round(results.macros.fat.grams)}g</p>
                  <p className="text-sm text-muted-foreground">Gorduras</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive font-medium">Erro no cálculo:</p>
              <p className="text-destructive/80">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedCalculationPanel;
