
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, TrendingUp, User, Calendar, Ruler, Calculator } from 'lucide-react';
import { PatientCompleteData } from '@/services/patient/PatientDataService';

interface PatientHistoryPanelProps {
  completeData: PatientCompleteData | null;
  isLoading: boolean;
}

const PatientHistoryPanel: React.FC<PatientHistoryPanelProps> = ({ 
  completeData, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-green"></div>
        <span className="ml-2 text-sm text-muted-foreground">Carregando histórico...</span>
      </div>
    );
  }

  if (!completeData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado histórico encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { patient, anthropometryHistory, consultationHistory, lastMeasurement, lastConsultation } = completeData;

  // Preparar dados para gráficos
  const weightEvolution = anthropometryHistory
    .filter(measurement => measurement.weight && measurement.date)
    .map(measurement => ({
      date: new Date(measurement.date).toLocaleDateString('pt-BR'),
      weight: measurement.weight,
      imc: measurement.imc || null
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const hasAnthropometryData = anthropometryHistory.length > 0;
  const hasConsultationData = consultationHistory.length > 0;

  return (
    <div className="space-y-6">
      {/* Resumo do Paciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {patient.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Idade</p>
              <p className="font-medium">{patient.age || 'Não informada'} anos</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sexo</p>
              <p className="font-medium capitalize">{patient.gender === 'male' ? 'Masculino' : 'Feminino'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                {patient.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="anthropometry" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="anthropometry" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Antropometria ({anthropometryHistory.length})
          </TabsTrigger>
          <TabsTrigger value="consultations" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Consultas ({consultationHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anthropometry" className="space-y-4">
          {hasAnthropometryData ? (
            <>
              {/* Última Medição */}
              {lastMeasurement && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Última Medição
                      <Badge variant="secondary">
                        {new Date(lastMeasurement.date).toLocaleDateString('pt-BR')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {lastMeasurement.weight && (
                        <div>
                          <p className="text-sm text-muted-foreground">Peso</p>
                          <p className="font-medium">{lastMeasurement.weight} kg</p>
                        </div>
                      )}
                      {lastMeasurement.height && (
                        <div>
                          <p className="text-sm text-muted-foreground">Altura</p>
                          <p className="font-medium">{lastMeasurement.height} cm</p>
                        </div>
                      )}
                      {lastMeasurement.imc && (
                        <div>
                          <p className="text-sm text-muted-foreground">IMC</p>
                          <p className="font-medium">{lastMeasurement.imc}</p>
                        </div>
                      )}
                      {lastMeasurement.body_fat_pct && (
                        <div>
                          <p className="text-sm text-muted-foreground">% Gordura</p>
                          <p className="font-medium">{lastMeasurement.body_fat_pct}%</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gráfico de Evolução do Peso */}
              {weightEvolution.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Evolução do Peso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weightEvolution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [`${value} kg`, 'Peso']}
                            labelFormatter={(label) => `Data: ${label}`}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#22c55e" 
                            fill="#22c55e" 
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de Medições */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Medições</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {anthropometryHistory
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((measurement, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            {new Date(measurement.date).toLocaleDateString('pt-BR')}
                          </p>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {Math.abs(Math.floor((new Date().getTime() - new Date(measurement.date).getTime()) / (1000 * 3600 * 24)))} dias atrás
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {measurement.weight && (
                            <span>Peso: <strong>{measurement.weight}kg</strong></span>
                          )}
                          {measurement.height && (
                            <span>Altura: <strong>{measurement.height}cm</strong></span>
                          )}
                          {measurement.imc && (
                            <span>IMC: <strong>{measurement.imc}</strong></span>
                          )}
                          {measurement.body_fat_pct && (
                            <span>% Gordura: <strong>{measurement.body_fat_pct}%</strong></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Ruler className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma medição antropométrica registrada</p>
                  <p className="text-sm">As medições aparecerão aqui após serem coletadas</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          {hasConsultationData ? (
            <>
              {/* Última Consulta */}
              {lastConsultation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Última Consulta
                      <Badge variant="secondary">
                        {new Date(lastConsultation.created_at || lastConsultation.calculation_date).toLocaleDateString('pt-BR')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Objetivo</p>
                        <p className="font-medium capitalize">{lastConsultation.objective || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Atividade</p>
                        <p className="font-medium capitalize">{lastConsultation.activity_level || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">GET</p>
                        <p className="font-medium">{lastConsultation.get || 0} kcal</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Proteína</p>
                        <p className="font-medium">{lastConsultation.protein_g || 0}g</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de Consultas */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Consultas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultationHistory
                      .sort((a, b) => new Date(b.created_at || b.calculation_date).getTime() - new Date(a.created_at || a.calculation_date).getTime())
                      .map((consultation, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            Consulta #{consultationHistory.length - index}
                          </p>
                          <Badge variant="outline">
                            {new Date(consultation.created_at || consultation.calculation_date).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <span>GET: <strong>{consultation.get || 0} kcal</strong></span>
                          <span>Proteína: <strong>{consultation.protein_g || 0}g</strong></span>
                          <span>Carboidrato: <strong>{consultation.carbs_g || 0}g</strong></span>
                          <span>Gordura: <strong>{consultation.fat_g || 0}g</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma consulta registrada</p>
                  <p className="text-sm">O histórico de consultas aparecerá aqui</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientHistoryPanel;
