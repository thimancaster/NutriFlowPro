
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar, Plus, User, FileText, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mock data
  const recentPatients = [
    { id: 1, name: 'Ana Silva', date: '15/04/2025', status: 'Em andamento' },
    { id: 2, name: 'Carlos Santos', date: '14/04/2025', status: 'Novo' },
    { id: 3, name: 'Maria Oliveira', date: '12/04/2025', status: 'Concluído' },
  ];

  // Summary cards data
  const summaryCards = [
    { title: 'Total de Pacientes', value: '42', icon: User, color: 'bg-blue-500', image: 'https://images.unsplash.com/photo-1517093727143-a58c00fda25d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
    { title: 'Consultas Hoje', value: '3', icon: Calendar, color: 'bg-green-500', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
    { title: 'Planos Ativos', value: '28', icon: FileText, color: 'bg-teal-500', image: 'https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-nutri-blue-light to-nutri-blue rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Bem-vindo ao NutriFlow Pro</h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl">O sistema completo para nutricionistas que desejam otimizar seus processos e entregar resultados excepcionais para seus pacientes.</p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-white text-nutri-blue hover:bg-opacity-90">Iniciar Agora</Button>
          <Button 
            variant="outline" 
            className="text-nutri-blue border-nutri-blue hover:bg-nutri-blue hover:text-white"
          >
            Conhecer Recursos
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <Card key={index} className="nutri-card overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="h-32 overflow-hidden relative">
              <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-3 left-4 text-white">
                <div className="flex items-center">
                  <card.icon className="h-5 w-5 mr-2" />
                  <p className="font-medium">{card.title}</p>
                </div>
              </div>
            </div>
            <CardContent className="pt-4">
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
      <Card className="nutri-card border-none shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Pacientes Recentes</CardTitle>
            <Link to="/patients">
              <Button className="bg-nutri-green hover:bg-nutri-green-dark">
                <Plus className="h-4 w-4 mr-2" /> Novo Paciente
              </Button>
            </Link>
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
          <Link to="/patients" className="w-full">
            <Button variant="outline" className="w-full">Ver todos os pacientes</Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="nutri-card shadow-lg border-none">
          <CardHeader>
            <CardTitle>Ferramentas Rápidas</CardTitle>
            <CardDescription>Acesso rápido às ferramentas mais utilizadas</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link to="/calculator" className="w-full">
              <Button className="bg-gradient-to-r from-nutri-blue-light to-nutri-blue hover:opacity-90 h-auto py-4 w-full flex flex-col items-center">
                <span className="text-sm mb-1">Calcular</span>
                <span className="text-xs">TMB & GET</span>
              </Button>
            </Link>
            <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:opacity-90 h-auto py-4 flex flex-col items-center">
              <span className="text-sm mb-1">Distribuir</span>
              <span className="text-xs">Macronutrientes</span>
            </Button>
            <Link to="/meal-plans" className="w-full">
              <Button className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90 h-auto py-4 w-full flex flex-col items-center">
                <span className="text-sm mb-1">Plano</span>
                <span className="text-xs">Alimentar</span>
              </Button>
            </Link>
            <Button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:opacity-90 h-auto py-4 flex flex-col items-center">
              <span className="text-sm mb-1">Relatório</span>
              <span className="text-xs">Nutricional</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="nutri-card shadow-lg border-none relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 z-0"></div>
          <CardHeader className="relative z-10">
            <CardTitle>Status da Versão</CardTitle>
            <CardDescription>Versão atual e recursos disponíveis</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Versão:</span>
                <span className="font-medium">NutriFlow Pro 1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Plano:</span>
                <span className="bg-gradient-to-r from-blue-400 to-blue-500 px-2 py-0.5 rounded-full text-sm text-white">Freemium</span>
              </div>
              <div className="flex justify-between">
                <span>Pacientes Permitidos:</span>
                <span className="font-medium">10/10</span>
              </div>
              <Button className="w-full mt-3 bg-gradient-to-r from-nutri-blue to-nutri-blue-dark hover:opacity-90">
                <Star className="h-4 w-4 mr-2" /> Atualizar para Pro
              </Button>
            </div>
          </CardContent>
          <div className="absolute bottom-0 right-0 -mb-4 -mr-4 text-blue-100 opacity-20">
            <Star className="h-32 w-32" />
          </div>
        </Card>
      </div>

      {/* Testimonials */}
      <Card className="nutri-card shadow-lg border-none bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 text-red-500 mr-2" /> Depoimentos de Usuários
          </CardTitle>
          <CardDescription>O que os nutricionistas estão dizendo sobre o NutriFlow Pro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="italic text-gray-600">"O NutriFlow Pro transformou minha clínica! Consigo gerenciar meus pacientes e criar planos alimentares em uma fração do tempo que costumava gastar."</p>
              <p className="mt-2 font-medium">Dra. Camila Mendes</p>
              <p className="text-sm text-gray-500">Nutricionista Clínica</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="italic text-gray-600">"Meus pacientes adoram os planos alimentares detalhados e personalizados. O sistema é intuitivo e economiza muito do meu tempo."</p>
              <p className="mt-2 font-medium">Dr. Roberto Almeida</p>
              <p className="text-sm text-gray-500">Nutricionista Esportivo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
