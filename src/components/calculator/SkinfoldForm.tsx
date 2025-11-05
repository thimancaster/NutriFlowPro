/**
 * SKINFOLD CALCULATOR FORM
 * Calcula composição corporal usando protocolos Jackson & Pollock
 * Suporta: 3-sites e 7-sites
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Activity, Info } from 'lucide-react';
import { 
  analyzeBodyComposition_3Site, 
  analyzeBodyComposition_7Site,
  type JacksonPollock3SiteMeasurements,
  type JacksonPollock7SiteMeasurements,
  type BodyCompositionResult
} from '@/utils/nutrition/bodyComposition';
import { useToast } from '@/hooks/use-toast';

interface SkinfoldFormProps {
  weight: number;
  age: number;
  gender: 'M' | 'F';
  onLeanMassCalculated?: (leanMass: number) => void;
}

const SkinfoldForm: React.FC<SkinfoldFormProps> = ({
  weight,
  age,
  gender,
  onLeanMassCalculated
}) => {
  const [protocol, setProtocol] = useState<'3-site' | '7-site'>('3-site');
  const [results, setResults] = useState<BodyCompositionResult | null>(null);
  const { toast } = useToast();

  // 3-site measurements
  const [measurements3, setMeasurements3] = useState<JacksonPollock3SiteMeasurements>({
    chest: 0,
    abdomen: 0,
    thigh: 0
  });

  // 7-site measurements
  const [measurements7, setMeasurements7] = useState<JacksonPollock7SiteMeasurements>({
    chest: 0,
    midaxillary: 0,
    triceps: 0,
    subscapular: 0,
    abdomen: 0,
    suprailiac: 0,
    thigh: 0
  });

  // Reset results when protocol changes
  useEffect(() => {
    setResults(null);
  }, [protocol]);

  const handleCalculate = () => {
    if (!weight || !age) {
      toast({
        title: "Dados Incompletos",
        description: "Peso e idade são obrigatórios. Preencha-os no formulário principal.",
        variant: "destructive"
      });
      return;
    }

    try {
      let result: BodyCompositionResult;

      if (protocol === '3-site') {
        // Validate 3-site measurements
        if (!measurements3.chest || !measurements3.abdomen || !measurements3.thigh) {
          toast({
            title: "Medidas Incompletas",
            description: "Preencha todas as 3 dobras cutâneas.",
            variant: "destructive"
          });
          return;
        }

        result = analyzeBodyComposition_3Site(measurements3, weight, age, gender);
      } else {
        // Validate 7-site measurements
        const allMeasurements = Object.values(measurements7);
        if (allMeasurements.some((m): m is number => typeof m === 'number' && m <= 0)) {
          toast({
            title: "Medidas Incompletas",
            description: "Preencha todas as 7 dobras cutâneas.",
            variant: "destructive"
          });
          return;
        }

        result = analyzeBodyComposition_7Site(measurements7, weight, age, gender);
      }

      setResults(result);

      // Auto-fill lean mass if callback provided
      if (onLeanMassCalculated) {
        onLeanMassCalculated(result.leanBodyMass);
      }

      toast({
        title: "Cálculo Completo",
        description: `% Gordura: ${result.bodyFatPercentage.toFixed(1)}% | MM: ${result.leanBodyMass.toFixed(1)}kg`,
      });

    } catch (error: any) {
      toast({
        title: "Erro no Cálculo",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="flex gap-2 items-start">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Como Medir Dobras Cutâneas:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Use um adipômetro calibrado (plicômetro)</li>
                <li>Todas as medidas devem ser do lado DIREITO do corpo</li>
                <li>Pinçar a dobra cutânea com polegar e indicador</li>
                <li>Aplicar o adipômetro a 1cm da pinça</li>
                <li>Aguardar 2-3 segundos antes de ler o valor</li>
                <li>Valores em milímetros (mm)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Data Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Peso</p>
            <p className="text-2xl font-bold">{weight || 0} kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Idade</p>
            <p className="text-2xl font-bold">{age || 0} anos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Sexo</p>
            <p className="text-2xl font-bold">{gender === 'M' ? '♂' : '♀'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Selection */}
      <Tabs value={protocol} onValueChange={(value) => setProtocol(value as '3-site' | '7-site')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="3-site">
            <div className="flex flex-col items-center">
              <span>3-Sites</span>
              <span className="text-xs text-muted-foreground">Rápido</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="7-site">
            <div className="flex flex-col items-center">
              <span>7-Sites</span>
              <span className="text-xs text-muted-foreground">Preciso</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* 3-Site Protocol */}
        <TabsContent value="3-site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Jackson & Pollock 3-Sites ({gender === 'M' ? 'Masculino' : 'Feminino'})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chest3">
                  {gender === 'M' ? 'Peitoral' : 'Tríceps'} (mm)
                </Label>
                <Input
                  id="chest3"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 15.5"
                  value={measurements3.chest || ''}
                  onChange={(e) => setMeasurements3({
                    ...measurements3,
                    chest: Number(e.target.value)
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  {gender === 'M' 
                    ? 'Dobra diagonal entre linha axilar e mamilo' 
                    : 'Dobra vertical no meio do tríceps'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abdomen3">Abdômen (mm)</Label>
                <Input
                  id="abdomen3"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 25.0"
                  value={measurements3.abdomen || ''}
                  onChange={(e) => setMeasurements3({
                    ...measurements3,
                    abdomen: Number(e.target.value)
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  {gender === 'M'
                    ? 'Dobra vertical 2cm à direita da cicatriz umbilical'
                    : 'Dobra vertical 2cm à direita da cicatriz umbilical'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thigh3">
                  {gender === 'M' ? 'Coxa' : 'Suprailíaca'} (mm)
                </Label>
                <Input
                  id="thigh3"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 20.0"
                  value={measurements3.thigh || ''}
                  onChange={(e) => setMeasurements3({
                    ...measurements3,
                    thigh: Number(e.target.value)
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  {gender === 'M'
                    ? 'Dobra vertical na linha média anterior da coxa'
                    : 'Dobra diagonal acima da crista ilíaca'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7-Site Protocol */}
        <TabsContent value="7-site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Jackson & Pollock 7-Sites (Protocolo Completo)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chest7">Peitoral (mm)</Label>
                <Input
                  id="chest7"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 15.5"
                  value={measurements7.chest || ''}
                  onChange={(e) => setMeasurements7({
                    ...measurements7,
                    chest: Number(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="midaxillary7">Axilar Média (mm)</Label>
                <Input
                  id="midaxillary7"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 12.0"
                  value={measurements7.midaxillary || ''}
                  onChange={(e) => setMeasurements7({
                    ...measurements7,
                    midaxillary: Number(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="triceps7">Tríceps (mm)</Label>
                <Input
                  id="triceps7"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 18.0"
                  value={measurements7.triceps || ''}
                  onChange={(e) => setMeasurements7({
                    ...measurements7,
                    triceps: Number(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscapular7">Subescapular (mm)</Label>
                <Input
                  id="subscapular7"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 20.0"
                  value={measurements7.subscapular || ''}
                  onChange={(e) => setMeasurements7({
                    ...measurements7,
                    subscapular: Number(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abdomen7">Abdômen (mm)</Label>
                <Input
                  id="abdomen7"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 25.0"
                  value={measurements7.abdomen || ''}
                  onChange={(e) => setMeasurements7({
                    ...measurements7,
                    abdomen: Number(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suprailiac7">Suprailíaca (mm)</Label>
                <Input
                  id="suprailiac7"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 22.0"
                  value={measurements7.suprailiac || ''}
                  onChange={(e) => setMeasurements7({
                    ...measurements7,
                    suprailiac: Number(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thigh7">Coxa (mm)</Label>
                <Input
                  id="thigh7"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 20.0"
                  value={measurements7.thigh || ''}
                  onChange={(e) => setMeasurements7({
                    ...measurements7,
                    thigh: Number(e.target.value)
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calculate Button */}
      <Button 
        onClick={handleCalculate} 
        className="w-full" 
        size="lg"
        disabled={!weight || !age}
      >
        <Calculator className="mr-2 h-5 w-5" />
        Calcular Composição Corporal
      </Button>

      {/* Results Display */}
      {results && (
        <Card className="bg-primary/5 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados - Composição Corporal</span>
              <Badge variant="default">
                {protocol === '3-site' ? 'J&P 3-Sites' : 'J&P 7-Sites'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">% Gordura</p>
                <p className="text-3xl font-bold text-orange-600">
                  {results.bodyFatPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {results.formula === 'siri' ? 'Equação de Siri' : 'Equação de Brozek'}
                </p>
              </div>

              <div className="text-center p-4 bg-background rounded-lg border-2 border-primary">
                <p className="text-sm text-muted-foreground mb-1">Massa Magra</p>
                <p className="text-3xl font-bold text-primary">
                  {results.leanBodyMass.toFixed(1)} kg
                </p>
                <p className="text-xs text-muted-foreground mt-1">Peso - Gordura</p>
              </div>

              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Massa Gorda</p>
                <p className="text-3xl font-bold text-red-600">
                  {results.fatMass.toFixed(1)} kg
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((results.fatMass / weight) * 100).toFixed(1)}% do peso
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 text-sm">Detalhes do Cálculo</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Densidade Corporal:</span>
                  <span className="font-mono">{results.bodyDensity.toFixed(4)} g/cm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocolo:</span>
                  <span className="font-medium">Jackson & Pollock {results.protocol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equação % GC:</span>
                  <span className="font-medium">{results.formula === 'siri' ? 'Siri (1961)' : 'Brozek (1963)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sexo:</span>
                  <span className="font-medium">{results.gender === 'M' ? 'Masculino' : 'Feminino'}</span>
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Referência de Classificação ({gender === 'M' ? 'Masculino' : 'Feminino'}):</strong>
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                {gender === 'M' ? (
                  <>
                    <li>• Essencial: 2-5% | Atleta: 6-13% | Fitness: 14-17% | Aceitável: 18-24% | Obesidade: &gt;25%</li>
                  </>
                ) : (
                  <>
                    <li>• Essencial: 10-13% | Atleta: 14-20% | Fitness: 21-24% | Aceitável: 25-31% | Obesidade: &gt;32%</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkinfoldForm;
