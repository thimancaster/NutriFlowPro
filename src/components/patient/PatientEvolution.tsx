
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { calculationHistoryService } from '@/services/calculationHistoryService';
import { TrendingUp, TrendingDown, Download, Table, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PatientEvolutionProps {
  patientId: string;
}

type PeriodFilter = 'month' | '3months' | '6months' | 'year' | 'all';
type ViewMode = 'chart' | 'table';

const PatientEvolution: React.FC<PatientEvolutionProps> = ({ patientId }) => {
  const [period, setPeriod] = useState<PeriodFilter>('6months');
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const { toast } = useToast();

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['patient-calculation-history', patientId, period],
    queryFn: () => calculationHistoryService.getPatientHistory(patientId, period),
    enabled: !!patientId
  });

  // Preparar dados para gráficos
  const evolutionData = React.useMemo(() => {
    if (!historyData) return [];
    
    return historyData.map(item => ({
      date: new Date(item.calculation_date).toLocaleDateString('pt-BR'),
      weight: item.weight,
      imc: Number((item.weight / Math.pow(item.height / 100, 2)).toFixed(1)),
      tmb: item.tmb,
      get: item.get,
      vet: item.vet,
      protein: item.protein_g,
      carbs: item.carbs_g,
      fat: item.fat_g,
      fullDate: item.calculation_date
    })).reverse(); // Mais antigos primeiro para o gráfico
  }, [historyData]);

  const macroData = React.useMemo(() => {
    if (!historyData) return [];
    
    return historyData.slice(0, 5).map(item => ({
      date: new Date(item.calculation_date).toLocaleDateString('pt-BR'),
      Proteínas: item.protein_g,
      Carboidratos: item.carbs_g,
      Gorduras: item.fat_g
    })).reverse();
  }, [historyData]);

  const handleDownloadChart = (chartType: string) => {
    // Implementar download do gráfico como PNG
    toast({
      title: 'Download iniciado',
      description: `Gráfico de ${chartType} será baixado em breve.`
    });
  };

  const getWeightTrend = () => {
    if (evolutionData.length < 2) return null;
    const first = evolutionData[0].weight;
    const last = evolutionData[evolutionData.length - 1].weight;
    return last - first;
  };

  const getIMCClassification = (imc: number) => {
    if (imc < 18.5) return { text: 'Baixo peso', color: 'text-blue-600' };
    if (imc < 25) return { text: 'Normal', color: 'text-green-600' };
    if (imc < 30) return { text: 'Sobrepeso', color: 'text-yellow-600' };
    return { text: 'Obesidade', color: 'text-red-600' };
  };

  const chartConfig = {
    weight: {
      label: "Peso (kg)",
      color: "#8884d8",
    },
    imc: {
      label: "IMC",
      color: "#82ca9d",
    },
    tmb: {
      label: "TMB",
      color: "#ffc658",
    },
    get: {
      label: "GET",
      color: "#ff7300",
    },
    vet: {
      label: "VET",
      color: "#00ff88",
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando evolução...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500">Erro ao carregar dados de evolução</p>
        </CardContent>
      </Card>
    );
  }

  if (!evolutionData.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Nenhum dado de evolução encontrado para o período selecionado</p>
        </CardContent>
      </Card>
    );
  }

  const weightTrend = getWeightTrend();
  const latestData = evolutionData[evolutionData.length - 1];
  const imcClass = getIMCClassification(latestData?.imc || 0);

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: PeriodFilter) => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="3months">3 meses</SelectItem>
              <SelectItem value="6months">6 meses</SelectItem>
              <SelectItem value="year">1 ano</SelectItem>
              <SelectItem value="all">Todo histórico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Gráficos
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <Table className="h-4 w-4 mr-1" />
            Tabela
          </Button>
        </div>
      </div>

      {/* Resumo dos dados mais recentes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Peso Atual</p>
                <p className="text-2xl font-bold">{latestData?.weight}kg</p>
              </div>
              {weightTrend !== null && (
                <div className={`flex items-center ${weightTrend > 0 ? 'text-red-500' : weightTrend < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                  {weightTrend > 0 ? <TrendingUp className="h-4 w-4" /> : weightTrend < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                  <span className="text-sm ml-1">
                    {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)}kg
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500">IMC Atual</p>
              <p className="text-2xl font-bold">{latestData?.imc}</p>
              <p className={`text-sm ${imcClass.color}`}>{imcClass.text}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500">GET Atual</p>
              <p className="text-2xl font-bold">{latestData?.get}</p>
              <p className="text-sm text-gray-500">kcal/dia</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500">VET Atual</p>
              <p className="text-2xl font-bold">{latestData?.vet}</p>
              <p className="text-sm text-gray-500">kcal/dia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal */}
      {viewMode === 'chart' ? (
        <Tabs defaultValue="weight" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weight">Peso e IMC</TabsTrigger>
            <TabsTrigger value="energy">Energia</TabsTrigger>
            <TabsTrigger value="macros">Macronutrientes</TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Evolução do Peso e IMC</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadChart('peso-imc')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PNG
                </Button>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="weight" orientation="left" />
                      <YAxis yAxisId="imc" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line 
                        yAxisId="weight"
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Peso (kg)"
                      />
                      <Line 
                        yAxisId="imc"
                        type="monotone" 
                        dataKey="imc" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="IMC"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="energy" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Evolução Energética (TMB, GET, VET)</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadChart('energia')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PNG
                </Button>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="tmb" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        name="TMB (kcal)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="get" 
                        stroke="#ff7300" 
                        strokeWidth={2}
                        name="GET (kcal)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="vet" 
                        stroke="#00ff88" 
                        strokeWidth={2}
                        name="VET (kcal)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="macros" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Distribuição de Macronutrientes</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadChart('macros')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PNG
                </Button>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={macroData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="Proteínas" fill="#8884d8" />
                      <Bar dataKey="Carboidratos" fill="#82ca9d" />
                      <Bar dataKey="Gorduras" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tabela de Evolução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-2 text-left">Data</th>
                    <th className="border border-gray-200 p-2 text-left">Peso (kg)</th>
                    <th className="border border-gray-200 p-2 text-left">IMC</th>
                    <th className="border border-gray-200 p-2 text-left">TMB (kcal)</th>
                    <th className="border border-gray-200 p-2 text-left">GET (kcal)</th>
                    <th className="border border-gray-200 p-2 text-left">VET (kcal)</th>
                    <th className="border border-gray-200 p-2 text-left">Proteína (g)</th>
                    <th className="border border-gray-200 p-2 text-left">Carbs (g)</th>
                    <th className="border border-gray-200 p-2 text-left">Gordura (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {evolutionData.slice().reverse().map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-2">{item.date}</td>
                      <td className="border border-gray-200 p-2">{item.weight}</td>
                      <td className="border border-gray-200 p-2">{item.imc}</td>
                      <td className="border border-gray-200 p-2">{item.tmb}</td>
                      <td className="border border-gray-200 p-2">{item.get}</td>
                      <td className="border border-gray-200 p-2">{item.vet}</td>
                      <td className="border border-gray-200 p-2">{item.protein}</td>
                      <td className="border border-gray-200 p-2">{item.carbs}</td>
                      <td className="border border-gray-200 p-2">{item.fat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientEvolution;
