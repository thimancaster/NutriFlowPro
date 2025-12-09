import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOfficialCalculations } from '@/hooks/useOfficialCalculations';
import { useActivePatient } from '@/hooks/useActivePatient';
import { Calculator, User, Activity, Target, AlertTriangle, Info } from 'lucide-react';

interface OfficialCalculatorFormProps {
  onCalculationComplete?: (results: any) => void;
  initialData?: any;
}

// Calculate age from birth date
const calculateAgeFromBirthDate = (birthDate: string | Date | null | undefined): number => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
};

// Smart tips based on profile
const getProteinTip = (profile: string): string => {
  switch (profile) {
    case 'atleta':
      return 'Sugestão literatura: 1.6 a 2.4 g/kg';
    case 'eutrofico':
      return 'Sugestão literatura: 1.2 a 1.8 g/kg';
    case 'sobrepeso_obesidade':
      return 'Sugestão literatura: 1.2 a 1.5 g/kg (peso ajustado) ou conforme conduta.';
    default:
      return 'Sugestão literatura: 1.2 a 2.0 g/kg';
  }
};

export const OfficialCalculatorForm: React.FC<OfficialCalculatorFormProps> = ({
  onCalculationComplete,
  initialData
}) => {
  const { toast } = useToast();
  const { activePatient } = useActivePatient();
  const { inputs, updateInputs, calculate, loading, results } = useOfficialCalculations();

  // Local form state
  const [weight, setWeight] = useState<string>(initialData?.weight?.toString() || '');
  const [height, setHeight] = useState<string>(initialData?.height?.toString() || '');
  const [age, setAge] = useState<string>(initialData?.age?.toString() || '');
  const [gender, setGender] = useState<string>(initialData?.gender || 'M');
  const [activityLevel, setActivityLevel] = useState<string>(initialData?.activityLevel || 'moderado');
  const [profile, setProfile] = useState<string>(initialData?.profile || 'eutrofico');
  const [objective, setObjective] = useState<string>(initialData?.objective || 'manutenção');
  const [proteinPerKg, setProteinPerKg] = useState<string>('1.6');
  const [fatPerKg, setFatPerKg] = useState<string>('1.0');

  // Load patient data if available
  useEffect(() => {
    if (activePatient) {
      if (activePatient.birth_date) {
        const calculatedAge = calculateAgeFromBirthDate(activePatient.birth_date);
        if (calculatedAge > 0) {
          setAge(calculatedAge.toString());
        }
      }
      if (activePatient.gender) {
        setGender(activePatient.gender === 'male' ? 'M' : 'F');
      }
    }
  }, [activePatient]);

  // Validation warnings (visual only, don't block)
  const proteinWarning = useMemo(() => {
    const val = parseFloat(proteinPerKg);
    if (isNaN(val)) return null;
    if (val > 3.0) return 'Valor acima do usual (>3.0 g/kg)';
    if (val < 0.8) return 'Valor abaixo do usual (<0.8 g/kg)';
    return null;
  }, [proteinPerKg]);

  const fatWarning = useMemo(() => {
    const val = parseFloat(fatPerKg);
    if (isNaN(val)) return null;
    if (val > 1.5) return 'Valor acima do usual (>1.5 g/kg)';
    if (val < 0.4) return 'Valor abaixo do usual (<0.4 g/kg)';
    return null;
  }, [fatPerKg]);

  // Get safe age (from input or patient birth date)
  const getSafeAge = (): number => {
    const inputAge = parseInt(age, 10);
    if (inputAge && inputAge > 0) return inputAge;
    
    if (activePatient?.birth_date) {
      return calculateAgeFromBirthDate(activePatient.birth_date);
    }
    
    return 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const safeAge = getSafeAge();
    
    // Validate required fields
    if (!weight || parseFloat(weight) <= 0) {
      toast({
        title: "Peso Inválido",
        description: "Por favor, informe o peso do paciente.",
        variant: "destructive"
      });
      return;
    }

    if (!height || parseFloat(height) <= 0) {
      toast({
        title: "Altura Inválida",
        description: "Por favor, informe a altura do paciente.",
        variant: "destructive"
      });
      return;
    }

    if (safeAge <= 0) {
      toast({
        title: "Idade Inválida",
        description: "Por favor, preencha a idade ou verifique a data de nascimento do paciente.",
        variant: "destructive"
      });
      return;
    }

    // Update inputs in the hook
    updateInputs({
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: safeAge,
      gender: gender as 'M' | 'F',
      activityLevel: activityLevel as any,
      profile: profile as any,
      objective: objective as any,
      macroInputs: {
        proteinPerKg: parseFloat(proteinPerKg) || 1.6,
        fatPerKg: parseFloat(fatPerKg) || 1.0
      }
    });

    try {
      const calculationResults = await calculate();
      
      if (calculationResults && onCalculationComplete) {
        // Extract values safely - tmb is {value, formula}, get is number
        const tmbValue = typeof calculationResults.tmb === 'object' 
          ? calculationResults.tmb?.value || 0 
          : calculationResults.tmb || 0;
        const getValue = typeof calculationResults.get === 'object'
          ? (calculationResults.get as any)?.value || 0
          : calculationResults.get || 0;
        
        onCalculationComplete({
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: safeAge,
          gender,
          activityLevel,
          profile,
          goal: objective,
          tmb: tmbValue,
          get: getValue,
          vet: calculationResults.vet || 0,
          macros: {
            protein: calculationResults.macros?.protein?.grams || 0,
            carbs: calculationResults.macros?.carbs?.grams || 0,
            fat: calculationResults.macros?.fat?.grams || 0
          }
        });
      }
    } catch (error) {
      console.error('[FORM] Calculation error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Info Banner */}
      {activePatient && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{activePatient.name}</span>
          {activePatient.birth_date && (
            <Badge variant="secondary" className="text-xs">
              {calculateAgeFromBirthDate(activePatient.birth_date)} anos
            </Badge>
          )}
        </div>
      )}

      {/* Basic Data */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Dados Antropométricos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              step="1"
              min="100"
              max="250"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Idade (anos)</Label>
            <Input
              id="age"
              type="number"
              step="1"
              min="10"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Sexo</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity & Profile */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Perfil e Atividade
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile">Perfil Corporal</Label>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger id="profile">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eutrofico">Eutrófico</SelectItem>
                <SelectItem value="sobrepeso_obesidade">Sobrepeso/Obesidade</SelectItem>
                <SelectItem value="atleta">Atleta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Nível de Atividade</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger id="activityLevel">
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
          <div className="space-y-2">
            <Label htmlFor="objective">Objetivo</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger id="objective">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                <SelectItem value="manutenção">Manutenção</SelectItem>
                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Macros Configuration */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Configuração de Macros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Protein Input */}
          <div className="space-y-2">
            <Label htmlFor="proteinPerKg">Proteína (g/kg)</Label>
            <Input
              id="proteinPerKg"
              type="number"
              step="0.1"
              min="0.5"
              max="4.0"
              value={proteinPerKg}
              onChange={(e) => setProteinPerKg(e.target.value)}
              className={proteinWarning ? 'border-amber-500' : ''}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              {getProteinTip(profile)}
            </p>
            {proteinWarning && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {proteinWarning}
              </p>
            )}
            {weight && (
              <p className="text-xs text-primary">
                = {Math.round(parseFloat(proteinPerKg || '0') * parseFloat(weight || '0'))} g de proteína
              </p>
            )}
          </div>

          {/* Fat Input */}
          <div className="space-y-2">
            <Label htmlFor="fatPerKg">Gordura (g/kg)</Label>
            <Input
              id="fatPerKg"
              type="number"
              step="0.1"
              min="0.2"
              max="2.5"
              value={fatPerKg}
              onChange={(e) => setFatPerKg(e.target.value)}
              className={fatWarning ? 'border-amber-500' : ''}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Faixa usual: 0.6 a 1.2 g/kg
            </p>
            {fatWarning && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {fatWarning}
              </p>
            )}
            {weight && (
              <p className="text-xs text-primary">
                = {Math.round(parseFloat(fatPerKg || '0') * parseFloat(weight || '0'))} g de gordura
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Calculator className="h-4 w-4 mr-2 animate-spin" />
            Calculando...
          </>
        ) : (
          <>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular
          </>
        )}
      </Button>

      {/* Results Preview */}
      {results && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="py-3">
            <CardTitle className="text-base">Resultados</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">TMB</p>
              <p className="text-lg font-bold">{results.tmb?.value || 0} kcal</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">GET</p>
              <p className="text-lg font-bold">{typeof results.get === 'object' ? (results.get as any)?.value || 0 : results.get || 0} kcal</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">VET</p>
              <p className="text-lg font-bold text-primary">{results.vet || 0} kcal</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Macros (P/C/G)</p>
              <p className="text-lg font-bold">
                {results.macros?.protein?.grams || 0}g / {results.macros?.carbs?.grams || 0}g / {results.macros?.fat?.grams || 0}g
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
};

export default OfficialCalculatorForm;
