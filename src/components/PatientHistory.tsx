
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PatientHistory = () => {
  // Mock data for patient history
  const weightsData = [
    { date: '01/01/2025', weight: 85 },
    { date: '15/01/2025', weight: 83.5 },
    { date: '01/02/2025', weight: 82.2 },
    { date: '15/02/2025', weight: 81.1 },
    { date: '01/03/2025', weight: 80.3 },
    { date: '15/03/2025', weight: 79.8 },
    { date: '01/04/2025', weight: 79.0 },
    { date: '15/04/2025', weight: 78.5 },
  ];

  const consultationHistory = [
    {
      date: '15/04/2025',
      notes: 'Paciente relatou maior disposição e menor ansiedade para comer. Mantendo o consumo de água adequado.',
      metrics: { weight: 78.5, bodyFat: '22%', muscle: '34%' },
      plan: 'Ajuste de macronutrientes para aumentar proteínas e reduzir carboidratos.'
    },
    {
      date: '01/04/2025',
      notes: 'Paciente queixou dificuldade para cumprir plano alimentar nos finais de semana. Suplementação de whey protein iniciada.',
      metrics: { weight: 79.0, bodyFat: '22.3%', muscle: '33.8%' },
      plan: 'Manter plano atual com opções mais flexíveis para finais de semana.'
    },
    {
      date: '15/03/2025',
      notes: 'Resultados positivos na redução de peso. Paciente relata maior facilidade para realizar atividades físicas.',
      metrics: { weight: 79.8, bodyFat: '22.8%', muscle: '33.5%' },
      plan: 'Aumentar consumo de proteínas e fibras para maior saciedade.'
    },
    {
      date: '01/03/2025',
      notes: 'Primeiro mês de acompanhamento concluído. Boa adesão ao plano alimentar, porém consumo de água ainda abaixo do recomendado.',
      metrics: { weight: 80.3, bodyFat: '23.2%', muscle: '33.2%' },
      plan: 'Manter plano alimentar com inclusão de lembretes para hidratação.'
    },
    {
      date: '01/02/2025',
      notes: 'Consulta inicial. Avaliação corporal realizada. Paciente com objetivos de perda de peso e melhora na qualidade alimentar.',
      metrics: { weight: 85.0, bodyFat: '24%', muscle: '32.5%' },
      plan: 'Plano alimentar com déficit calórico moderado e recomendação de atividade física.'
    },
  ];

  return (
    <Card className="nutri-card w-full">
      <CardHeader>
        <CardTitle>Histórico do Paciente</CardTitle>
        <CardDescription>
          Acompanhe a evolução e consultas do paciente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="evolutions">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="evolutions">Evolução</TabsTrigger>
            <TabsTrigger value="consultations">Consultas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="evolutions">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Evolução do Peso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={weightsData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
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
                  <div className="mt-4">
                    <h4 className="font-medium">Resumo da evolução</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Redução total: <span className="font-medium text-nutri-green-dark">
                        {weightsData[0].weight - weightsData[weightsData.length-1].weight} kg
                      </span> em {weightsData.length - 1} consultas
                    </p>
                    <p className="text-sm text-gray-600">
                      Média de perda: <span className="font-medium">
                        {((weightsData[0].weight - weightsData[weightsData.length-1].weight) / (weightsData.length - 1)).toFixed(1)} kg
                      </span> por consulta
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Métricas Atuais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-nutri-gray-light rounded-lg p-3">
                        <p className="text-xs text-gray-500">Peso</p>
                        <p className="text-lg font-medium">{weightsData[weightsData.length - 1].weight} kg</p>
                      </div>
                      <div className="bg-nutri-gray-light rounded-lg p-3">
                        <p className="text-xs text-gray-500">G. Corporal</p>
                        <p className="text-lg font-medium">{consultationHistory[0].metrics.bodyFat}</p>
                      </div>
                      <div className="bg-nutri-gray-light rounded-lg p-3">
                        <p className="text-xs text-gray-500">Massa M.</p>
                        <p className="text-lg font-medium">{consultationHistory[0].metrics.muscle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Metas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Peso Alvo</span>
                        <span className="font-medium">75 kg</span>
                      </div>
                      <div className="w-full bg-nutri-gray-light rounded-full h-2.5">
                        <div className="bg-nutri-green h-2.5 rounded-full" style={{ 
                          width: `${Math.min(100, Math.max(0, ((85 - weightsData[weightsData.length - 1].weight) / (85 - 75)) * 100))}%` 
                        }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Inicial: 85kg</span>
                        <span>Faltam: {Math.max(0, (weightsData[weightsData.length - 1].weight - 75)).toFixed(1)}kg</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="consultations">
            <div className="space-y-4">
              {consultationHistory.map((consultation, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="bg-nutri-gray-light px-6 py-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Consulta: {consultation.date}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${index === 0 ? 'bg-nutri-green-light text-white' : 'bg-nutri-gray text-white'}`}>
                        {index === 0 ? 'Mais recente' : ''}
                      </span>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-1">Métricas</h5>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="border rounded-md p-2">
                            <p className="text-xs text-gray-500">Peso</p>
                            <p className="font-medium">{consultation.metrics.weight} kg</p>
                          </div>
                          <div className="border rounded-md p-2">
                            <p className="text-xs text-gray-500">G. Corporal</p>
                            <p className="font-medium">{consultation.metrics.bodyFat}</p>
                          </div>
                          <div className="border rounded-md p-2">
                            <p className="text-xs text-gray-500">Massa M.</p>
                            <p className="font-medium">{consultation.metrics.muscle}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-1">Observações</h5>
                        <p className="text-sm">{consultation.notes}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-1">Conduta</h5>
                        <p className="text-sm">{consultation.plan}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PatientHistory;
