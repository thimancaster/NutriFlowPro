
import React from 'react';
import { UnifiedEcosystemProvider } from '@/contexts/UnifiedEcosystemContext';
import EcosystemNavigation from '@/components/ecosystem/EcosystemNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Calendar, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <UnifiedEcosystemProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Gerencie seus atendimentos e acompanhe o progresso dos pacientes
            </p>
          </div>

          <EcosystemNavigation />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pacientes Ativos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Nenhum paciente cadastrado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Consultas Hoje
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Nenhuma consulta agendada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Planos Gerados
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Nenhum plano criado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Sucesso
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Dados insuficientes
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Cadastrar primeiro paciente</p>
                      <p className="text-sm text-muted-foreground">
                        Comece cadastrando um paciente para usar o sistema
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Realizar cálculo nutricional</p>
                      <p className="text-sm text-muted-foreground">
                        Use a calculadora para determinar necessidades calóricas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Gerar plano alimentar</p>
                      <p className="text-sm text-muted-foreground">
                        Crie planos personalizados com inteligência cultural
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Calculadora Nutricional</span>
                    <span className="text-green-600">✓ Ativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fluxo Clínico</span>
                    <span className="text-green-600">✓ Ativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gerador de Planos</span>
                    <span className="text-green-600">✓ Ativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Inteligência Cultural</span>
                    <span className="text-green-600">✓ Ativo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UnifiedEcosystemProvider>
  );
};

export default Dashboard;
