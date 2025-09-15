import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ClinicalSession, ClinicalSessionService } from '@/services/clinicalSessionService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientEvolutionChartProps {
  patientId: string;
  patientName?: string;
}

interface EvolutionDataPoint {
  date: string;
  formattedDate: string;
  weight?: number;
  bmi?: number;
  vet?: number;
  protein?: number;
  session_type: string;
}

const PatientEvolutionChart: React.FC<PatientEvolutionChartProps> = ({ 
  patientId, 
  patientName = "Paciente" 
}) => {
  const [sessions, setSessions] = useState<ClinicalSession[]>([]);
  const [evolutionData, setEvolutionData] = useState<EvolutionDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState({
    weight: true,
    bmi: false,
    vet: false,
    protein: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEvolutionData();
  }, [patientId]);

  const loadEvolutionData = async () => {
    setIsLoading(true);
    try {
      const result = await ClinicalSessionService.getAllSessions(patientId);
      
      if (result.success && result.data) {
        setSessions(result.data);
        processEvolutionData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load sessions');
      }
    } catch (error: any) {
      console.error('Error loading evolution data:', error);
      toast({
        title: "Erro ao Carregar Evolução",
        description: "Não foi possível carregar os dados de evolução do paciente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processEvolutionData = (sessions: ClinicalSession[]) => {
    const data: EvolutionDataPoint[] = sessions.map(session => {
      const consultationData = session.consultation_data || {};
      const nutritionalResults = session.nutritional_results || {};
      
      return {
        date: session.created_at,
        formattedDate: format(parseISO(session.created_at), 'dd/MM/yyyy', { locale: ptBR }),
        weight: consultationData.weight || consultationData.anthropometry?.weight,
        bmi: consultationData.bmi || 
             (consultationData.weight && consultationData.height ? 
              consultationData.weight / Math.pow(consultationData.height / 100, 2) : undefined),
        vet: nutritionalResults.vet || nutritionalResults.totalCalories,
        protein: nutritionalResults.protein,
        session_type: session.session_type
      };
    }).filter(dataPoint => 
      // Only include data points that have at least one metric
      dataPoint.weight || dataPoint.bmi || dataPoint.vet || dataPoint.protein
    );

    setEvolutionData(data);
  };

  const getLatestValue = (metric: keyof EvolutionDataPoint): number | undefined => {
    for (let i = evolutionData.length - 1; i >= 0; i--) {
      const value = evolutionData[i][metric];
      if (typeof value === 'number') return value;
    }
    return undefined;
  };

  const getPreviousValue = (metric: keyof EvolutionDataPoint): number | undefined => {
    let latestFound = false;
    for (let i = evolutionData.length - 1; i >= 0; i--) {
      const value = evolutionData[i][metric];
      if (typeof value === 'number') {
        if (latestFound) return value;
        latestFound = true;
      }
    }
    return undefined;
  };

  const getTrendIcon = (metric: keyof EvolutionDataPoint) => {
    const latest = getLatestValue(metric);
    const previous = getPreviousValue(metric);
    
    if (!latest || !previous) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    if (latest > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (latest < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const formatValue = (value: number | undefined, unit: string): string => {
    if (value === undefined) return 'N/A';
    return `${value.toFixed(1)}${unit}`;
  };

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dados de evolução...</span>
        </CardContent>
      </Card>
    );
  }

  if (evolutionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução de {patientName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum dado de evolução disponível.</p>
            <p className="text-sm mt-2">Complete algumas consultas para visualizar a evolução do paciente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer" onClick={() => toggleMetric('weight')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peso</p>
                <p className="text-2xl font-bold">{formatValue(getLatestValue('weight'), 'kg')}</p>
              </div>
              {getTrendIcon('weight')}
            </div>
            <div className={`w-2 h-2 rounded-full mt-2 ${selectedMetrics.weight ? 'bg-blue-500' : 'bg-gray-300'}`} />
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => toggleMetric('bmi')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">IMC</p>
                <p className="text-2xl font-bold">{formatValue(getLatestValue('bmi'), '')}</p>
              </div>
              {getTrendIcon('bmi')}
            </div>
            <div className={`w-2 h-2 rounded-full mt-2 ${selectedMetrics.bmi ? 'bg-green-500' : 'bg-gray-300'}`} />
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => toggleMetric('vet')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">VET</p>
                <p className="text-2xl font-bold">{formatValue(getLatestValue('vet'), 'kcal')}</p>
              </div>
              {getTrendIcon('vet')}
            </div>
            <div className={`w-2 h-2 rounded-full mt-2 ${selectedMetrics.vet ? 'bg-orange-500' : 'bg-gray-300'}`} />
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => toggleMetric('protein')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Proteína</p>
                <p className="text-2xl font-bold">{formatValue(getLatestValue('protein'), 'g')}</p>
              </div>
              {getTrendIcon('protein')}
            </div>
            <div className={`w-2 h-2 rounded-full mt-2 ${selectedMetrics.protein ? 'bg-purple-500' : 'bg-gray-300'}`} />
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de {patientName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Clique nos cards acima para mostrar/ocultar métricas no gráfico
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(label) => `Data: ${label}`}
                  formatter={(value: any, name: string) => {
                    const units = { weight: 'kg', bmi: '', vet: 'kcal', protein: 'g' };
                    const unit = units[name as keyof typeof units] || '';
                    return [value ? `${value}${unit}` : 'N/A', name];
                  }}
                />
                <Legend />
                
                {selectedMetrics.weight && (
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Peso (kg)"
                  />
                )}
                
                {selectedMetrics.bmi && (
                  <Line 
                    type="monotone" 
                    dataKey="bmi" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="IMC"
                  />
                )}
                
                {selectedMetrics.vet && (
                  <Line 
                    type="monotone" 
                    dataKey="vet" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                    name="VET (kcal)"
                  />
                )}
                
                {selectedMetrics.protein && (
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    name="Proteína (g)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sessões ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {sessions.map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {session.session_type === 'consultation' ? 'Primeira Consulta' : 'Acompanhamento'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(session.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  #{sessions.length - index}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientEvolutionChart;