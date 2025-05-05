
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Copy } from 'lucide-react';

// Mock data for patient
const mockPatient = {
  id: "1",
  name: "Ana Silva",
  sex: "F",
  birthdate: "1990-05-15",
  age: 35,
  objectives: "Emagrecimento",
  profile: "Atleta"
};

// Mock data for consultations history
const mockConsultations = [
  {
    id: "1",
    date: "15/04/2025",
    weight: 74.5,
    height: 168,
    age: 35,
    tmb: 1512,
    fa: 1.55,
    get: 2343,
    macros: { protein: 146, carbs: 234, fat: 78 },
    notes: "Primeira consulta. Paciente apresenta histórico de prática regular de atividade física.",
    tipo: 'primeira_consulta',
    status: 'completo',
    last_auto_save: '2025-04-15T15:30:00Z'
  },
  {
    id: "2",
    date: "01/04/2025",
    weight: 75.2,
    height: 168,
    age: 35,
    tmb: 1520,
    fa: 1.55,
    get: 2356,
    macros: { protein: 147, carbs: 236, fat: 79 },
    notes: "Paciente relata dificuldade em seguir o plano alimentar nos fins de semana.",
    tipo: 'retorno',
    status: 'completo',
    last_auto_save: '2025-04-01T14:45:00Z'
  },
  {
    id: "3",
    date: "15/03/2025",
    weight: 76.8,
    height: 168,
    age: 35,
    tmb: 1533,
    fa: 1.55,
    get: 2376,
    macros: { protein: 149, carbs: 238, fat: 79 },
    notes: "Iniciou suplementação com whey protein após o treino.",
    tipo: 'retorno',
    status: 'completo',
    last_auto_save: '2025-03-15T16:20:00Z'
  },
  {
    id: "4",
    date: "01/03/2025",
    weight: 77.5,
    height: 168,
    age: 35,
    tmb: 1548,
    fa: 1.55,
    get: 2399,
    macros: { protein: 150, carbs: 240, fat: 80 },
    notes: "Primeira avaliação após retorno das férias.",
    tipo: 'retorno',
    status: 'completo',
    last_auto_save: '2025-03-01T10:15:00Z'
  },
  {
    id: "5",
    date: "15/02/2025",
    weight: 78.2,
    height: 168,
    age: 35,
    tmb: 1555,
    fa: 1.55,
    get: 2410,
    macros: { protein: 151, carbs: 241, fat: 80 },
    notes: "Paciente demonstra boa adesão ao plano.",
    tipo: 'retorno',
    status: 'completo',
    last_auto_save: '2025-02-15T11:30:00Z'
  },
];

// Prepare chart data
const chartData = [...mockConsultations].reverse().map(consultation => ({
  date: consultation.date,
  weight: consultation.weight,
  get: consultation.get,
}));

const PatientHistory = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<string>("all");
  
  // Filter consultations based on the selected period
  const filteredConsultations = (() => {
    switch (period) {
      case "last-month":
        return mockConsultations.slice(0, 2);
      case "last-3-months":
        return mockConsultations.slice(0, 4);
      default:
        return mockConsultations;
    }
  })();
  
  const handleRepeatConsultation = (consultationId: string) => {
    // Find the consultation to duplicate
    const consultation = mockConsultations.find(c => c.id === consultationId);
    
    if (consultation) {
      navigate('/consultation', { 
        state: { 
          patientId, 
          repeatConsultation: consultation 
        } 
      });
    }
  };

  // Get appropriate badge color based on consultation type and status
  const getConsultationTypeBadgeColor = (tipo: string) => {
    return tipo === 'primeira_consulta' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };
  
  const getStatusBadgeColor = (status: string) => {
    return status === 'completo' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';
  };

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
            <h1 className="text-3xl font-bold text-nutri-blue mb-2">Histórico de {mockPatient.name}</h1>
            <div className="flex flex-wrap gap-3">
              <div className="bg-nutri-gray-light rounded-lg px-3 py-1 text-sm">
                {mockPatient.age} anos
              </div>
              <div className="bg-nutri-gray-light rounded-lg px-3 py-1 text-sm">
                {mockPatient.sex === 'M' ? 'Masculino' : 'Feminino'}
              </div>
              <div className="bg-nutri-gray-light rounded-lg px-3 py-1 text-sm">
                {mockPatient.objectives}
              </div>
              <div className="bg-nutri-gray-light rounded-lg px-3 py-1 text-sm">
                {mockPatient.profile}
              </div>
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
                    <p className="text-xl font-bold text-nutri-blue">{chartData[0].weight} kg</p>
                  </div>
                  <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Peso Atual</h3>
                    <p className="text-xl font-bold text-nutri-green">{chartData[chartData.length - 1].weight} kg</p>
                  </div>
                  <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Diferença</h3>
                    <p className={`text-xl font-bold ${chartData[0].weight - chartData[chartData.length - 1].weight > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(chartData[0].weight - chartData[chartData.length - 1].weight).toFixed(1)} kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="nutri-card shadow-lg border-none">
              <CardHeader>
                <CardTitle>Últimos Indicadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Peso Atual</p>
                    <p className="text-2xl font-bold text-nutri-blue">
                      {mockConsultations[0].weight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">TMB</p>
                    <p className="text-2xl font-bold text-nutri-green">
                      {mockConsultations[0].tmb} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">GET</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {mockConsultations[0].get} kcal
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium mb-2">Macros (g/dia)</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-nutri-gray-light rounded-lg p-2">
                        <p className="text-xs text-gray-500">PTN</p>
                        <p className="text-lg font-medium">{mockConsultations[0].macros.protein}</p>
                      </div>
                      <div className="bg-nutri-gray-light rounded-lg p-2">
                        <p className="text-xs text-gray-500">CHO</p>
                        <p className="text-lg font-medium">{mockConsultations[0].macros.carbs}</p>
                      </div>
                      <div className="bg-nutri-gray-light rounded-lg p-2">
                        <p className="text-xs text-gray-500">LIP</p>
                        <p className="text-lg font-medium">{mockConsultations[0].macros.fat}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <h2 className="text-xl font-bold mt-8 mb-4">Histórico de Consultas</h2>
        
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="nutri-card shadow-md border-none">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Consulta: {consultation.date}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getConsultationTypeBadgeColor(consultation.tipo || 'primeira_consulta')}`}>
                            {consultation.tipo === 'retorno' ? 'Retorno' : 'Primeira Consulta'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(consultation.status || 'em_andamento')}`}>
                            {consultation.status === 'completo' ? 'Completo' : 'Em andamento'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/meal-plan/${consultation.id}`)}
                          className="text-nutri-blue hover:text-nutri-blue-dark hover:bg-blue-50"
                        >
                          <FileText className="h-4 w-4 mr-1" /> Ver plano
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleRepeatConsultation(consultation.id)}
                          className="text-nutri-green hover:text-nutri-green-dark hover:bg-green-50"
                        >
                          <Copy className="h-4 w-4 mr-1" /> Repetir consulta
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Peso</p>
                        <p className="font-medium">{consultation.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">TMB</p>
                        <p className="font-medium">{consultation.tmb} kcal</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">F.A.</p>
                        <p className="font-medium">{consultation.fa}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">GET</p>
                        <p className="font-medium">{consultation.get} kcal</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm text-gray-500">Observações:</p>
                      <p className="text-sm">{consultation.notes}</p>
                    </div>
                    
                    {consultation.last_auto_save && (
                      <div className="text-xs text-gray-500 mt-2">
                        Último salvamento automático: {new Date(consultation.last_auto_save).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
