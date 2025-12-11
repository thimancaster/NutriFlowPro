/**
 * REPORTS PAGE
 * Comparative reports showing evolution of TMB, GET, VET and macros across consultations
 * Features: Patient selection, evolution charts, metrics comparison, PDF export, Trend Analysis
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, TrendingUp, TrendingDown, Minus, FileText, Users, Calendar, BarChart3 } from 'lucide-react';
import EvolutionChart from '@/components/reports/EvolutionChart';
import TrendAnalysisDashboard from '@/components/food-database/TrendAnalysisDashboard';
import { 
  fetchAllPatientsCalculationHistory, 
  calculateEvolution,
  type PatientEvolutionData 
} from '@/services/reportsService';
import { generatePatientEvolutionPDF, generateComparativePDF } from '@/utils/pdfExport';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Fetch all patients' calculation history
  const { data: patientsData, isLoading, error } = useQuery({
    queryKey: ['patients-calculation-history', user?.id],
    queryFn: () => fetchAllPatientsCalculationHistory(user!.id),
    enabled: !!user?.id,
  });

  const selectedPatientData = patientsData?.find(pd => pd.patient.id === selectedPatientId);
  const evolution = selectedPatientData ? calculateEvolution(selectedPatientData.calculations) : null;

  const handleExportPatientPDF = () => {
    if (!selectedPatientData) {
      toast({
        title: "Erro",
        description: "Selecione um paciente primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      generatePatientEvolutionPDF(selectedPatientData);
      toast({
        title: "PDF Gerado",
        description: "O relatório foi baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório",
        variant: "destructive"
      });
    }
  };

  const handleExportComparativePDF = () => {
    if (!patientsData || patientsData.length === 0) {
      toast({
        title: "Sem Dados",
        description: "Não há dados para gerar o relatório comparativo",
        variant: "destructive"
      });
      return;
    }

    try {
      generateComparativePDF(patientsData);
      toast({
        title: "PDF Gerado",
        description: "O relatório comparativo foi baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório",
        variant: "destructive"
      });
    }
  };

  const renderTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar dados: {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!patientsData || patientsData.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sem Dados Disponíveis</h3>
            <p className="text-muted-foreground">
              Não há consultas registradas para gerar relatórios. Realize atendimentos e cálculos nutricionais primeiro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Relatórios Comparativos</h1>
          <p className="text-muted-foreground">
            Acompanhe a evolução nutricional dos seus pacientes ao longo do tempo
          </p>
        </div>
        <Button onClick={handleExportComparativePDF} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Comparativo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pacientes</p>
                <p className="text-2xl font-bold">{patientsData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Consultas</p>
                <p className="text-2xl font-bold">
                  {patientsData.reduce((sum, pd) => sum + pd.calculations.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacientes com Evolução</p>
                <p className="text-2xl font-bold">
                  {patientsData.filter(pd => pd.calculations.length >= 2).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="individual">Análise Individual</TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Individual Patient Analysis */}
        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Paciente</CardTitle>
              <CardDescription>
                Escolha um paciente para visualizar sua evolução detalhada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {patientsData.map(pd => (
                      <SelectItem key={pd.patient.id} value={pd.patient.id}>
                        {pd.patient.name} ({pd.calculations.length} consulta{pd.calculations.length !== 1 ? 's' : ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPatientData && (
                  <Button onClick={handleExportPatientPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedPatientData && (
            <>
              {/* Evolution Summary */}
              {evolution && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo da Evolução</CardTitle>
                    <CardDescription>
                      Comparação entre primeira e última consulta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Peso</p>
                          {renderTrendIcon(evolution.weight.change)}
                        </div>
                        <p className="text-2xl font-bold">{evolution.weight.value.toFixed(1)} kg</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatChange(evolution.weight.change)}
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">TMB</p>
                          {renderTrendIcon(evolution.tmb.change)}
                        </div>
                        <p className="text-2xl font-bold">{evolution.tmb.value.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          kcal - {formatChange(evolution.tmb.change)}
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">GET</p>
                          {renderTrendIcon(evolution.get.change)}
                        </div>
                        <p className="text-2xl font-bold">{evolution.get.value.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          kcal - {formatChange(evolution.get.change)}
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">VET</p>
                          {renderTrendIcon(evolution.vet.change)}
                        </div>
                        <p className="text-2xl font-bold">{evolution.vet.value.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          kcal - {formatChange(evolution.vet.change)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EvolutionChart
                  data={selectedPatientData.calculations}
                  title="Evolução de Peso e Energia"
                  metrics={[
                    { key: 'weight', name: 'Peso (kg)', color: '#8b5cf6' },
                    { key: 'tmb', name: 'TMB (kcal)', color: '#3b82f6' },
                    { key: 'get', name: 'GET (kcal)', color: '#10b981' },
                    { key: 'vet', name: 'VET (kcal)', color: '#f59e0b' }
                  ]}
                />

                <EvolutionChart
                  data={selectedPatientData.calculations}
                  title="Evolução de Macronutrientes"
                  metrics={[
                    { key: 'protein_g', name: 'Proteína (g)', color: '#3b82f6' },
                    { key: 'carbs_g', name: 'Carboidratos (g)', color: '#10b981' },
                    { key: 'fat_g', name: 'Gordura (g)', color: '#f59e0b' }
                  ]}
                />
              </div>

              {/* History Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Consultas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Consulta</th>
                          <th className="text-left p-2">Data</th>
                          <th className="text-right p-2">Peso</th>
                          <th className="text-right p-2">TMB</th>
                          <th className="text-right p-2">GET</th>
                          <th className="text-right p-2">VET</th>
                          <th className="text-right p-2">PTN (g)</th>
                          <th className="text-right p-2">CHO (g)</th>
                          <th className="text-right p-2">LIP (g)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPatientData.calculations.map((calc, index) => (
                          <tr key={calc.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <Badge variant="outline">#{calc.consultation_number}</Badge>
                            </td>
                            <td className="p-2">
                              {format(new Date(calc.calculation_date), 'dd/MM/yyyy')}
                            </td>
                            <td className="text-right p-2">{calc.weight.toFixed(1)} kg</td>
                            <td className="text-right p-2">{calc.tmb.toFixed(0)}</td>
                            <td className="text-right p-2">{calc.get.toFixed(0)}</td>
                            <td className="text-right p-2">{calc.vet.toFixed(0)}</td>
                            <td className="text-right p-2">{calc.protein_g.toFixed(0)}</td>
                            <td className="text-right p-2">{calc.carbs_g.toFixed(0)}</td>
                            <td className="text-right p-2">{calc.fat_g.toFixed(0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Overview of All Patients */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Pacientes</CardTitle>
              <CardDescription>
                Dados mais recentes de cada paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Paciente</th>
                      <th className="text-center p-2">Consultas</th>
                      <th className="text-left p-2">Última Consulta</th>
                      <th className="text-right p-2">Peso</th>
                      <th className="text-right p-2">TMB</th>
                      <th className="text-right p-2">GET</th>
                      <th className="text-right p-2">VET</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsData.map(pd => {
                      const lastCalc = pd.calculations[pd.calculations.length - 1];
                      return (
                        <tr key={pd.patient.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{pd.patient.name}</td>
                          <td className="text-center p-2">
                            <Badge variant="secondary">{pd.calculations.length}</Badge>
                          </td>
                          <td className="p-2">
                            {format(new Date(lastCalc.calculation_date), 'dd/MM/yyyy')}
                          </td>
                          <td className="text-right p-2">{lastCalc.weight.toFixed(1)} kg</td>
                          <td className="text-right p-2">{lastCalc.tmb.toFixed(0)} kcal</td>
                          <td className="text-right p-2">{lastCalc.get.toFixed(0)} kcal</td>
                          <td className="text-right p-2">{lastCalc.vet.toFixed(0)} kcal</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend Analysis */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análise de Tendências
              </CardTitle>
              <CardDescription>
                Visualize padrões e tendências nutricionais ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendAnalysisDashboard 
                patientId={user?.id}
                timeRange="month"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
