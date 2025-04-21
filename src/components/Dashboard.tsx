
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar, Plus, User, FileText } from 'lucide-react';

const Dashboard = () => {
  // Mock data
  const recentPatients = [
    { id: 1, name: 'Ana Silva', date: '15/04/2025', status: 'Em andamento' },
    { id: 2, name: 'Carlos Santos', date: '14/04/2025', status: 'Novo' },
    { id: 3, name: 'Maria Oliveira', date: '12/04/2025', status: 'Concluído' },
  ];

  // Summary cards data
  const summaryCards = [
    { title: 'Total de Pacientes', value: '42', icon: User, color: 'bg-nutri-blue-light' },
    { title: 'Consultas Hoje', value: '3', icon: Calendar, color: 'bg-nutri-green-light' },
    { title: 'Planos Ativos', value: '28', icon: FileText, color: 'bg-nutri-teal' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <Card key={index} className="nutri-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{card.value}</span>
                <div className={`${card.color} p-3 rounded-full`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Patients */}
      <Card className="nutri-card">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Pacientes Recentes</CardTitle>
            <Button className="bg-nutri-green hover:bg-nutri-green-dark">
              <Plus className="h-4 w-4 mr-2" /> Novo Paciente
            </Button>
          </div>
          <CardDescription>Gerencie seus pacientes recentes e consultados recentemente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2 font-medium">Nome</th>
                  <th className="pb-2 font-medium">Data</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b last:border-b-0">
                    <td className="py-3">{patient.name}</td>
                    <td className="py-3">{patient.date}</td>
                    <td className="py-3">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          patient.status === 'Novo' ? 'bg-nutri-blue-light text-white' : 
                          patient.status === 'Em andamento' ? 'bg-nutri-green-light text-white' : 
                          'bg-nutri-gray-light text-nutri-gray-dark'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" className="h-8 px-2 text-nutri-blue hover:text-nutri-blue-dark hover:bg-nutri-gray-light">
                        Ver detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button variant="outline" className="w-full">Ver todos os pacientes</Button>
        </CardFooter>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="nutri-card">
          <CardHeader>
            <CardTitle>Ferramentas Rápidas</CardTitle>
            <CardDescription>Acesso rápido às ferramentas mais utilizadas</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button className="bg-nutri-blue hover:bg-nutri-blue-dark h-auto py-4 flex flex-col items-center">
              <span className="text-sm mb-1">Calcular</span>
              <span className="text-xs">TMB & GET</span>
            </Button>
            <Button className="bg-nutri-teal hover:bg-nutri-teal h-auto py-4 flex flex-col items-center">
              <span className="text-sm mb-1">Distribuir</span>
              <span className="text-xs">Macronutrientes</span>
            </Button>
            <Button className="bg-nutri-green hover:bg-nutri-green-dark h-auto py-4 flex flex-col items-center">
              <span className="text-sm mb-1">Plano</span>
              <span className="text-xs">Alimentar</span>
            </Button>
            <Button className="bg-nutri-gray-dark hover:bg-nutri-gray-dark h-auto py-4 flex flex-col items-center">
              <span className="text-sm mb-1">Relatório</span>
              <span className="text-xs">Nutricional</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="nutri-card">
          <CardHeader>
            <CardTitle>Status da Versão</CardTitle>
            <CardDescription>Versão atual e recursos disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Versão:</span>
                <span className="font-medium">NutriVita 1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Plano:</span>
                <span className="bg-nutri-gray-light px-2 py-0.5 rounded-full text-sm">Freemium</span>
              </div>
              <div className="flex justify-between">
                <span>Pacientes Permitidos:</span>
                <span className="font-medium">10/10</span>
              </div>
              <Button className="w-full mt-3 bg-nutri-blue hover:bg-nutri-blue-dark">
                Atualizar para Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
