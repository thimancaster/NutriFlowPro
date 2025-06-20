
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Copy, Loader2 } from 'lucide-react';
import { usePatientData } from '@/hooks/patient/usePatientData';
import { usePatientMeasurements } from '@/hooks/patient/usePatientMeasurements';

const PatientHistory = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<string>("all");
  
  const { patient, loading: patientLoading, error: patientError } = usePatientData(patientId);
  const { measurements, loading: measurementsLoading, error: measurementsError } = usePatientMeasurements(patientId);
  
  const loading = patientLoading || measurementsLoading;
  const error = patientError || measurementsError;
  
  // Filter measurements based on the selected period
  const filteredMeasurements = (() => {
    switch (period) {
      case "last-month":
        return measurements.slice(0, 2);
      case "last-3-months":
        return measurements.slice(0, 4);
      default:
        return measurements;
    }
  })();
  
  // Prepare chart data
  const chartData = [...filteredMeasurements].reverse().map(measurement => ({
    date: measurement.date,
    weight: measurement.weight,
    get: measurement.get,
  }));
  
  const handleRepeatConsultation = (measurementId: string) => {
    const measurement = measurements.find(c => c.id === measurementId);
    
    if (measurement) {
      navigate('/consultation', { 
        state: { 
          patientId, 
          repeatConsultation: measurement 
        } 
      });
    }
  };

  const getConsultationTypeBadgeColor = (tipo: string) => {
    return tipo === 'primeira_consulta' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };
  
  const getStatusBadgeColor = (status: string) => {
    return status === 'completo' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-nutri-green" />
            <span className="ml-2 text-gray-600">Carregando histórico do paciente...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => navigate('/patients')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para pacientes
          </Button>
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <p>Erro ao carregar dados do paciente</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => navigate('/patients')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para pacientes
            </Button>
            <h1 className="text-3xl font-bold text-nutri-blue mb-2">Histórico de {patient.name}</h1>
            <div className="flex flex-wrap gap-3">
              {patient.age && (
                <div className="bg-nutri-gray-light rounded-lg px-3 py-1 text-sm">
                  {patient.age} anos
                </div>
              )}
              {patient.gender && (
                <div className="bg-nutri-gray-light rounded-lg px-3 py-1 text-sm">
                  {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'}
                </div>
              )}
              {patient.goals?.objective && (
                <div className="bg-nutri-gray-light rounded-lg px-3 py-1 text-sm">
                  {patient.goals.objective}
                </div>
              )}
              {patient.goals?.profile && (
                <div className="bg-nutri-gray-light rounded-lg px-3 py-1 text-sm">
                  {patient.goals.profile}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button 
              onClick={() => navigate(`/consultation?patientId=${patientId}`)}
              className="bg-nutri-green hover:bg-nutri-green-dark"
            >
              Nova Consulta
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="nutri-card shadow-lg border-none">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Evolução de Peso</CardTitle>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo período</SelectItem>
                      <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                      <SelectItem value="last-month">Último mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer>
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[(dataMin: number) => dataMin - 2, (dataMax: number) => dataMax + 2]} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#22c55e" 
                            activeDot={{ r: 8 }} 
                            name="Peso (kg)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
                        <h3 className="text-sm text-gray-500 mb-1">Peso Inicial</h3>
                        <p className="text-xl font-bold text-nutri-blue">{chartData[0]?.weight || '--'} kg</p>
                      </div>
                      <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
                        <h3 className="text-sm text-gray-500 mb-1">Peso Atual</h3>
                        <p className="text-xl font-bold text-nutri-green">{chartData[chartData.length - 1]?.weight || '--'} kg</p>
                      </div>
                      <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
                        <h3 className="text-sm text-gray-500 mb-1">Diferença</h3>
                        <p className={`text-xl font-bold ${
                          chartData.length >= 2 && (chartData[0].weight - chartData[chartData.length - 1].weight) > 0 
                            ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {chartData.length >= 2 
                            ? (chartData[0].weight - chartData[chartData.length - 1].weight).toFixed(1)
                            : '--'
                          } kg
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma medição registrada ainda.</p>
                    <Button 
                      onClick={() => navigate(`/consultation?patientId=${patientId}`)}
                      className="mt-4 bg-nutri-green hover:bg-nutri-green-dark"
                    >
                      Realizar primeira consulta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="nutri-card shadow-lg border-none">
              <CardHeader>
                <CardTitle>Últimos Indicadores</CardTitle>
              </CardHeader>
              <CardContent>
                {measurements.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Peso Atual</p>
                      <p className="text-2xl font-bold text-nutri-blue">
                        {measurements[0].weight} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">TMB</p>
                      <p className="text-2xl font-bold text-nutri-green">
                        {measurements[0].tmb} kcal
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">GET</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {measurements[0].get} kcal
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium mb-2">Macros (g/dia)</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-nutri-gray-light rounded-lg p-2">
                          <p className="text-xs text-gray-500">PTN</p>
                          <p className="text-lg font-medium">{measurements[0].macros.protein}</p>
                        </div>
                        <div className="bg-nutri-gray-light rounded-lg p-2">
                          <p className="text-xs text-gray-500">CHO</p>
                          <p className="text-lg font-medium">{measurements[0].macros.carbs}</p>
                        </div>
                        <div className="bg-nutri-gray-light rounded-lg p-2">
                          <p className="text-xs text-gray-500">LIP</p>
                          <p className="text-lg font-medium">{measurements[0].macros.fat}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Nenhuma medição disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <h2 className="text-xl font-bold mt-8 mb-4">Histórico de Consultas</h2>
        
        <div className="space-y-4">
          {filteredMeasurements.length > 0 ? (
            filteredMeasurements.map((measurement) => (
              <Card key={measurement.id} className="nutri-card shadow-md border-none">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Consulta: {measurement.date}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getConsultationTypeBadgeColor(measurement.tipo)}`}>
                              {measurement.tipo === 'retorno' ? 'Retorno' : 'Primeira Consulta'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(measurement.status)}`}>
                              {measurement.status === 'completo' ? 'Completo' : 'Em andamento'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/meal-plan/${measurement.id}`)}
                            className="text-nutri-blue hover:text-nutri-blue-dark hover:bg-blue-50"
                          >
                            <FileText className="h-4 w-4 mr-1" /> Ver plano
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleRepeatConsultation(measurement.id)}
                            className="text-nutri-green hover:text-nutri-green-dark hover:bg-green-50"
                          >
                            <Copy className="h-4 w-4 mr-1" /> Repetir consulta
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Peso</p>
                          <p className="font-medium">{measurement.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">TMB</p>
                          <p className="font-medium">{measurement.tmb} kcal</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">IMC</p>
                          <p className="font-medium">{measurement.imc}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">GET</p>
                          <p className="font-medium">{measurement.get} kcal</p>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-sm text-gray-500">Observações:</p>
                        <p className="text-sm">{measurement.notes}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="nutri-card shadow-md border-none">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 mb-4">Nenhuma consulta registrada ainda.</p>
                <Button 
                  onClick={() => navigate(`/consultation?patientId=${patientId}`)}
                  className="bg-nutri-green hover:bg-nutri-green-dark"
                >
                  Agendar primeira consulta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
