import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, TrendingUp, TrendingDown, Scale, Activity, Percent, Bot } from 'lucide-react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AuraInsights from './AuraInsights';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface EvolutionData {
  date: string;
  weight: number;
  vet?: number;
  bodyFatPct?: number;
  bmi?: number;
}

interface EvolutionStepProps {
  onComplete?: () => void;
}

const EvolutionStep: React.FC<EvolutionStepProps> = ({ onComplete }) => {
  const { activePatient } = usePatient();
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAura, setShowAura] = useState(false);

  useEffect(() => {
    if (activePatient?.id) {
      fetchEvolutionData();
    }
  }, [activePatient?.id]);

  const fetchEvolutionData = async () => {
    if (!activePatient?.id) return;

    setIsLoading(true);
    try {
      // Fetch calculation history
      const { data: calculations, error: calcError } = await supabase
        .from('calculation_history')
        .select('calculation_date, weight, vet, tmb')
        .eq('patient_id', activePatient.id)
        .order('calculation_date', { ascending: true })
        .limit(20);

      if (calcError) throw calcError;

      // Fetch anthropometry data
      const { data: anthropometry, error: anthroError } = await supabase
        .from('anthropometry')
        .select('date, weight, body_fat_pct, imc')
        .eq('patient_id', activePatient.id)
        .order('date', { ascending: true })
        .limit(20);

      if (anthroError) throw anthroError;

      // Merge and format data
      const mergedData: EvolutionData[] = [];
      const dateMap = new Map<string, EvolutionData>();

      // Add calculation data
      calculations?.forEach(calc => {
        const dateKey = calc.calculation_date.split('T')[0];
        const existing = dateMap.get(dateKey) || { date: dateKey, weight: 0 };
        dateMap.set(dateKey, {
          ...existing,
          weight: calc.weight || existing.weight,
          vet: calc.vet || existing.vet
        });
      });

      // Add anthropometry data
      anthropometry?.forEach(anthro => {
        const dateKey = anthro.date.split('T')[0];
        const existing = dateMap.get(dateKey) || { date: dateKey, weight: 0 };
        dateMap.set(dateKey, {
          ...existing,
          weight: anthro.weight || existing.weight,
          bodyFatPct: anthro.body_fat_pct || existing.bodyFatPct,
          bmi: anthro.imc || existing.bmi
        });
      });

      // Convert to array and sort
      const sortedData = Array.from(dateMap.values())
        .filter(d => d.weight > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEvolutionData(sortedData);
    } catch (error) {
      console.error('Error fetching evolution data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateChange = (metric: keyof EvolutionData) => {
    if (evolutionData.length < 2) return null;
    
    const first = evolutionData[0][metric] as number | undefined;
    const last = evolutionData[evolutionData.length - 1][metric] as number | undefined;
    
    if (!first || !last) return null;
    
    const diff = last - first;
    const percentChange = ((diff / first) * 100).toFixed(1);
    
    return {
      diff: diff.toFixed(1),
      percent: percentChange,
      isPositive: diff > 0
    };
  };

  const weightChange = calculateChange('weight');
  const vetChange = calculateChange('vet');
  const bodyFatChange = calculateChange('bodyFatPct');

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM', { locale: ptBR });
  };

  if (!activePatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Selecione um paciente para ver a evolução</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Evolução do Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : evolutionData.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Ainda não há dados suficientes para mostrar a evolução.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete mais atendimentos para acompanhar o progresso.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-blue-50 dark:bg-blue-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Peso</p>
                        <p className="text-2xl font-bold">
                          {evolutionData[evolutionData.length - 1]?.weight?.toFixed(1)} kg
                        </p>
                      </div>
                      <Scale className="h-8 w-8 text-blue-500" />
                    </div>
                    {weightChange && (
                      <div className="mt-2 flex items-center gap-1">
                        {weightChange.isPositive ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className={weightChange.isPositive ? 'text-red-500' : 'text-green-500'}>
                          {weightChange.diff} kg ({weightChange.percent}%)
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">VET</p>
                        <p className="text-2xl font-bold">
                          {evolutionData[evolutionData.length - 1]?.vet?.toFixed(0) || '-'} kcal
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-green-500" />
                    </div>
                    {vetChange && (
                      <div className="mt-2 flex items-center gap-1">
                        {vetChange.isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={vetChange.isPositive ? 'text-green-500' : 'text-red-500'}>
                          {vetChange.diff} kcal
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">% Gordura</p>
                        <p className="text-2xl font-bold">
                          {evolutionData[evolutionData.length - 1]?.bodyFatPct?.toFixed(1) || '-'}%
                        </p>
                      </div>
                      <Percent className="h-8 w-8 text-purple-500" />
                    </div>
                    {bodyFatChange && (
                      <div className="mt-2 flex items-center gap-1">
                        {bodyFatChange.isPositive ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className={bodyFatChange.isPositive ? 'text-red-500' : 'text-green-500'}>
                          {bodyFatChange.diff}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <Tabs defaultValue="weight" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="weight">Peso</TabsTrigger>
                  <TabsTrigger value="vet">VET</TabsTrigger>
                  <TabsTrigger value="composition">Composição</TabsTrigger>
                </TabsList>

                <TabsContent value="weight" className="mt-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip 
                          labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy', { locale: ptBR })}
                          formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Peso']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Peso (kg)"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="vet" className="mt-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={evolutionData.filter(d => d.vet)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip 
                          labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy', { locale: ptBR })}
                          formatter={(value: number) => [`${value.toFixed(0)} kcal`, 'VET']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="vet" 
                          stroke="hsl(142 76% 36%)" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="VET (kcal)"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="composition" className="mt-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={evolutionData.filter(d => d.bodyFatPct)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip 
                          labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy', { locale: ptBR })}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, '% Gordura']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="bodyFatPct" 
                          stroke="hsl(280 67% 50%)" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="% Gordura Corporal"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      {/* Aura AI Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Assistente IA Aura
            <Badge variant="secondary" className="ml-2">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showAura ? (
            <div className="text-center py-6">
              <Bot className="h-16 w-16 mx-auto text-primary/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Análise Inteligente com Aura</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                A Aura é sua assistente nutricional inteligente. Ela analisa os dados do paciente
                e oferece insights personalizados baseados na evolução clínica.
              </p>
              <Button onClick={() => setShowAura(true)} className="gap-2">
                <Bot className="h-4 w-4" />
                Pedir Análise da Aura
              </Button>
            </div>
          ) : (
            <AuraInsights 
              patientData={activePatient}
              evolutionData={evolutionData}
              onClose={() => setShowAura(false)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EvolutionStep;
