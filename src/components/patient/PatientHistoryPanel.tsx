import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { PatientCompleteData } from '@/services/patient/PatientDataService';

interface PatientHistoryPanelProps {
  completeData: PatientCompleteData | null;
  isLoading?: boolean;
}

const PatientHistoryPanel: React.FC<PatientHistoryPanelProps> = ({ 
  completeData, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-green"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!completeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum paciente selecionado
          </p>
        </CardContent>
      </Card>
    );
  }

  const { patient, anthropometryHistory, consultationHistory, lastMeasurement, lastConsultation } = completeData;

  // Process weight evolution data for chart
  const weightEvolution = anthropometryHistory
    .filter(m => m.weight && m.date)
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('pt-BR'),
      weight: m.weight,
      imc: m.imc || 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10); // Last 10 measurements

  // Process consultation evolution
  const consultationEvolution = consultationHistory
    .map(c => ({
      date: new Date(c.calculation_date || c.created_at).toLocaleDateString('pt-BR'),
      calories: c.get || 0,
      protein: c.protein_g || 0,
      consultation: c.consultation_number || 0
    }))
    .sort((a, b) => a.consultation - b.consultation)
    .slice(-10); // Last 10 consultations

  const hasAnthropometryData = anthropometryHistory.length > 0;
  const hasConsultationData = consultationHistory.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-nutri-green" />
          Histórico do Paciente: {patient.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="evolution" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
            <TabsTrigger value="measurements">Medições</TabsTrigger>
            <TabsTrigger value="consultations">Consultas</TabsTrigger>
          </TabsList>

          <TabsContent value="evolution" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Weight Evolution Chart */}
              {hasAnthropometryData && weightEvolution.length > 1 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Evolução do Peso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={weightEvolution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'weight' ? `${value} kg` : value,
                            name === 'weight' ? 'Peso' : 'IMC'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="hsl(var(--nutri-green))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--nutri-green))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Dados insuficientes para gráfico de peso</p>
                  </CardContent>
                </Card>
              )}

              {/* Consultation Evolution Chart */}
              {hasConsultationData && consultationEvolution.length > 1 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Evolução Nutricional
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={consultationEvolution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'calories' ? `${value} kcal` : `${value}g`,
                            name === 'calories' ? 'Calorias' : 'Proteína'
                          ]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="calories" 
                          stroke="hsl(var(--nutri-green))" 
                          fill="hsl(var(--nutri-green))" 
                          fillOpacity={0.3}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="protein" 
                          stroke="hsl(var(--nutri-blue))" 
                          fill="hsl(var(--nutri-blue))" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Dados insuficientes para gráfico nutricional</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-nutri-green">
                    {anthropometryHistory.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Medições registradas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-nutri-blue">
                    {consultationHistory.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Consultas realizadas</p>
                </CardContent>
              </Card>
              {lastMeasurement && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {lastMeasurement.weight?.toFixed(1) || '--'}kg
                    </div>
                    <p className="text-sm text-muted-foreground">Último peso</p>
                  </CardContent>
                </Card>
              )}
              {lastConsultation && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {lastConsultation.get || '--'}
                    </div>
                    <p className="text-sm text-muted-foreground">Último GET (kcal)</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="measurements" className="space-y-4">
            {hasAnthropometryData ? (
              <div className="space-y-3">
                {anthropometryHistory.slice(0, 10).map((measurement, index) => (
                  <Card key={`measurement-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(measurement.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <Badge variant="outline">
                          Medição {anthropometryHistory.length - index}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {measurement.weight && (
                          <div>
                            <span className="text-muted-foreground">Peso:</span>
                            <span className="ml-1 font-medium">{measurement.weight} kg</span>
                          </div>
                        )}
                        {measurement.height && (
                          <div>
                            <span className="text-muted-foreground">Altura:</span>
                            <span className="ml-1 font-medium">{measurement.height} cm</span>
                          </div>
                        )}
                        {measurement.imc && (
                          <div>
                            <span className="text-muted-foreground">IMC:</span>
                            <span className="ml-1 font-medium">{measurement.imc.toFixed(1)}</span>
                          </div>
                        )}
                        {measurement.body_fat_pct && (
                          <div>
                            <span className="text-muted-foreground">% Gordura:</span>
                            <span className="ml-1 font-medium">{measurement.body_fat_pct.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Nenhuma medição antropométrica registrada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="consultations" className="space-y-4">
            {hasConsultationData ? (
              <div className="space-y-3">
                {consultationHistory.slice(0, 10).map((consultation, index) => (
                  <Card key={`consultation-${consultation.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(consultation.calculation_date || consultation.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <Badge variant="outline">
                          Consulta #{consultation.consultation_number || index + 1}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">GET:</span>
                          <span className="ml-1 font-medium">{consultation.get} kcal</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Proteína:</span>
                          <span className="ml-1 font-medium">{consultation.protein_g}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carboidrato:</span>
                          <span className="ml-1 font-medium">{consultation.carbs_g}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gordura:</span>
                          <span className="ml-1 font-medium">{consultation.fat_g}g</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Objetivo:</span>
                        <span className="ml-1 font-medium capitalize">{consultation.objective}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Nenhuma consulta anterior registrada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PatientHistoryPanel;