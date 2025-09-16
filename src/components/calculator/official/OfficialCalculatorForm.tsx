import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, User, Activity, Target, Zap, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useOfficialCalculations } from '@/hooks/useOfficialCalculations';
import { useActivePatient } from '@/hooks/useActivePatient';
import type { 
  Gender, 
  PatientProfile, 
  ActivityLevel, 
  Objective,
  ManualMacroInputs,
  PercentageMacroInputs 
} from '@/utils/nutrition/official/officialCalculations';

interface OfficialCalculatorFormProps {
  onResultsCalculated?: (results: any) => void;
}

export const OfficialCalculatorForm: React.FC<OfficialCalculatorFormProps> = ({
  onResultsCalculated
}) => {
  const {
    inputs,
    results,
    loading,
    error,
    updateInputs,
    updateMacroInputs,
    updatePercentageInputs,
    calculate,
    reset,
    getValidation,
    canCalculate,
    availableFormulas
  } = useOfficialCalculations();

  const { activePatient } = useActivePatient();

  // Local form state
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '' as Gender,
    profile: '' as PatientProfile,
    activityLevel: '' as ActivityLevel,
    objective: '' as Objective
  });

  const [macroInputMethod, setMacroInputMethod] = useState<'grams_per_kg' | 'percentages'>('grams_per_kg');
  const [gramsPerKgInputs, setGramsPerKgInputs] = useState({
    proteinPerKg: '1.6',
    fatPerKg: '1.0'
  });
  const [percentageInputs, setPercentageInputs] = useState({
    proteinPercent: '20',
    fatPercent: '25',
    carbsPercent: '55'
  });

  // Pre-fill form with active patient data
  useEffect(() => {
    if (activePatient) {
      console.log('[CALCULATOR] Pre-filling with patient data:', activePatient.name);
      
      const patientAge = activePatient.birth_date 
        ? Math.floor((new Date().getTime() - new Date(activePatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : '';

      setFormData(prev => ({
        ...prev,
        weight: activePatient.weight?.toString() || prev.weight,
        height: activePatient.height?.toString() || prev.height,
        age: patientAge.toString() || prev.age,
        gender: (activePatient.gender === 'male' ? 'M' : activePatient.gender === 'female' ? 'F' : prev.gender) as Gender,
        activityLevel: (activePatient.goals?.activityLevel || prev.activityLevel) as ActivityLevel,
        objective: (activePatient.goals?.objective || prev.objective) as Objective,
        profile: (activePatient.goals?.profile || prev.profile) as PatientProfile
      }));
    }
  }, [activePatient]);

  // Update official inputs when form data changes
  useEffect(() => {
    const parsedInputs: any = {
      weight: parseFloat(formData.weight) || 0,
      height: parseFloat(formData.height) || 0,
      age: parseInt(formData.age) || 0,
      gender: formData.gender,
      profile: formData.profile,
      activityLevel: formData.activityLevel,
      objective: formData.objective
    };

    if (macroInputMethod === 'grams_per_kg') {
      parsedInputs.macroInputs = {
        proteinPerKg: parseFloat(gramsPerKgInputs.proteinPerKg) || 0,
        fatPerKg: parseFloat(gramsPerKgInputs.fatPerKg) || 0
      };
    } else {
      parsedInputs.percentageInputs = {
        proteinPercent: parseFloat(percentageInputs.proteinPercent) || 0,
        fatPercent: parseFloat(percentageInputs.fatPercent) || 0,
        carbsPercent: parseFloat(percentageInputs.carbsPercent) || 0
      };
    }

    updateInputs(parsedInputs);
  }, [formData, macroInputMethod, gramsPerKgInputs, percentageInputs, updateInputs]);

  // Handle calculation
  const handleCalculate = async () => {
    try {
      const result = await calculate();
      if (result && onResultsCalculated) {
        onResultsCalculated(result);
      }
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  // Get validation status
  const validation = getValidation();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          <CardTitle>Calculadora Nutricional Oficial</CardTitle>
        </div>
        <CardDescription>
          Sistema unificado baseado nas fórmulas oficiais auditadas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Data */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-primary" />
            <Label className="text-base font-medium">Dados Antropométricos</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                onFocus={(e) => {
                  if (e.target.value === '0') {
                    setFormData(prev => ({ ...prev, weight: '' }));
                  }
                }}
                placeholder="70.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                onFocus={(e) => {
                  if (e.target.value === '0') {
                    setFormData(prev => ({ ...prev, height: '' }));
                  }
                }}
                placeholder="170"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Idade (anos)</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                onFocus={(e) => {
                  if (e.target.value === '0') {
                    setFormData(prev => ({ ...prev, age: '' }));
                  }
                }}
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value: Gender) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fórmula de Cálculo</Label>
              <Select 
                value={formData.profile} 
                onValueChange={(value: PatientProfile) => setFormData(prev => ({ ...prev, profile: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a fórmula" />
                </SelectTrigger>
                <SelectContent>
                  {availableFormulas.map(formula => (
                    <SelectItem key={formula.value} value={formula.value}>
                      {formula.label} - {formula.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Activity and Objective */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-primary" />
            <Label className="text-base font-medium">Atividade e Objetivo</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nível de Atividade</Label>
              <Select 
                value={formData.activityLevel} 
                onValueChange={(value: ActivityLevel) => setFormData(prev => ({ ...prev, activityLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário (1.2)</SelectItem>
                  <SelectItem value="leve">Leve (1.375)</SelectItem>
                  <SelectItem value="moderado">Moderado (1.55)</SelectItem>
                  <SelectItem value="intenso">Intenso (1.725)</SelectItem>
                  <SelectItem value="muito_intenso">Muito Intenso (1.9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Select 
                value={formData.objective} 
                onValueChange={(value: Objective) => setFormData(prev => ({ ...prev, objective: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emagrecimento">Emagrecimento (-500 kcal)</SelectItem>
                  <SelectItem value="manutenção">Manutenção (0 kcal)</SelectItem>
                  <SelectItem value="hipertrofia">Hipertrofia (+400 kcal)</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Macro Inputs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <Label className="text-base font-medium">Distribuição de Macronutrientes</Label>
          </div>

          <Tabs value={macroInputMethod} onValueChange={(value) => setMacroInputMethod(value as 'grams_per_kg' | 'percentages')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grams_per_kg">g/kg Corporal</TabsTrigger>
              <TabsTrigger value="percentages">Percentuais</TabsTrigger>
            </TabsList>

            <TabsContent value="grams_per_kg" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Proteína (g/kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={gramsPerKgInputs.proteinPerKg}
                    onChange={(e) => setGramsPerKgInputs(prev => ({ ...prev, proteinPerKg: e.target.value }))}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        setGramsPerKgInputs(prev => ({ ...prev, proteinPerKg: '' }));
                      }
                    }}
                    placeholder="1.6"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Gordura (g/kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={gramsPerKgInputs.fatPerKg}
                    onChange={(e) => setGramsPerKgInputs(prev => ({ ...prev, fatPerKg: e.target.value }))}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        setGramsPerKgInputs(prev => ({ ...prev, fatPerKg: '' }));
                      }
                    }}
                    placeholder="1.0"
                  />
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Carboidratos serão calculados automaticamente pela energia restante.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="percentages" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Proteína (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={percentageInputs.proteinPercent}
                    onChange={(e) => setPercentageInputs(prev => ({ ...prev, proteinPercent: e.target.value }))}
                    placeholder="20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Gordura (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={percentageInputs.fatPercent}
                    onChange={(e) => setPercentageInputs(prev => ({ ...prev, fatPercent: e.target.value }))}
                    placeholder="25"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Carboidratos (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={percentageInputs.carbsPercent}
                    onChange={(e) => setPercentageInputs(prev => ({ ...prev, carbsPercent: e.target.value }))}
                    placeholder="55"
                  />
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Se não somar 100%, carboidratos serão ajustados automaticamente.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>

        {/* Validation Messages */}
        {validation.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {validation.errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {validation.warnings.map((warning, index) => (
                  <div key={index}>• {warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleCalculate} 
            disabled={!canCalculate() || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </>
            )}
          </Button>
          
          {results && (
            <Button variant="outline" onClick={reset}>
              Nova Consulta
            </Button>
          )}
        </div>

        {/* Results Display */}
        {results && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Resultados Oficiais</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Energy Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">TMB</p>
                      <p className="text-2xl font-bold">{results.tmb.value}</p>
                      <p className="text-xs text-muted-foreground">{results.tmb.formula}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">GET</p>
                      <p className="text-2xl font-bold">{results.get}</p>
                      <p className="text-xs text-muted-foreground">kcal/dia</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">VET</p>
                      <p className="text-2xl font-bold text-primary">{results.vet}</p>
                      <p className="text-xs text-muted-foreground">kcal/dia</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Macro Results */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Distribuição de Macronutrientes</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Proteína</p>
                        <p className="text-xl font-bold">{results.macros.protein.grams}g</p>
                        <p className="text-sm">{results.macros.protein.kcal} kcal</p>
                        <Badge variant="secondary">{results.macros.protein.percentage}%</Badge>
                        {results.proteinPerKg && (
                          <p className="text-xs text-muted-foreground">{results.proteinPerKg.toFixed(1)} g/kg</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Carboidratos</p>
                        <p className="text-xl font-bold">{results.macros.carbs.grams}g</p>
                        <p className="text-sm">{results.macros.carbs.kcal} kcal</p>
                        <Badge variant="secondary">{results.macros.carbs.percentage}%</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Gordura</p>
                        <p className="text-xl font-bold">{results.macros.fat.grams}g</p>
                        <p className="text-sm">{results.macros.fat.kcal} kcal</p>
                        <Badge variant="secondary">{results.macros.fat.percentage}%</Badge>
                        {results.fatPerKg && (
                          <p className="text-xs text-muted-foreground">{results.fatPerKg.toFixed(1)} g/kg</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Calculation Process */}
              <Card>
                <CardContent className="pt-6">
                  <Label className="text-sm font-medium">Processo de Cálculo</Label>
                  <div className="mt-2 space-y-1">
                    {results.calculationOrder.map((step, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        {step}
                      </p>
                    ))}
                  </div>
                  <Badge variant="outline" className="mt-2">
                    Método: {results.inputMethod === 'grams_per_kg' ? 'g/kg corporal' : 'Percentuais'}
                  </Badge>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};