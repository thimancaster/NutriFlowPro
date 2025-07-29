
import React from 'react';
import { UnifiedEcosystemProvider } from '@/contexts/UnifiedEcosystemContext';
import EcosystemNavigation from '@/components/ecosystem/EcosystemNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calculator, 
  Stethoscope, 
  Utensils,
  Calendar,
  TrendingUp 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const quickStats = [
    {
      title: 'Pacientes Ativos',
      value: '12',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Cálculos Hoje',
      value: '8',
      icon: Calculator,
      color: 'text-nutri-green'
    },
    {
      title: 'Consultas Pendentes',
      value: '3',
      icon: Stethoscope,
      color: 'text-amber-600'
    },
    {
      title: 'Planos Gerados',
      value: '15',
      icon: Utensils,
      color: 'text-purple-600'
    }
  ];

  return (
    <UnifiedEcosystemProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Nutricional</h1>
          <p className="text-muted-foreground">
            Gerencie seus pacientes e fluxos clínicos
          </p>
        </div>

        <EcosystemNavigation />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">Maria Silva</p>
                    <p className="text-sm text-muted-foreground">14:00 - Consulta de retorno</p>
                  </div>
                  <div className="text-sm text-muted-foreground">Hoje</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">João Santos</p>
                    <p className="text-sm text-muted-foreground">10:00 - Primeira consulta</p>
                  </div>
                  <div className="text-sm text-muted-foreground">Amanhã</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-nutri-green rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">Plano alimentar</span> gerado para Maria Silva
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">Cálculo nutricional</span> realizado para João Santos
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">Consulta</span> agendada para Ana Costa
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedEcosystemProvider>
  );
};

export default Dashboard;
