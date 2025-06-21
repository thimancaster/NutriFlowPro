import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Bell, Search, FileText, Zap, TrendingUp, Globe } from 'lucide-react';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import ConsultationTemplates from '@/components/templates/ConsultationTemplates';
import ExternalAPIIntegration from '@/components/integrations/ExternalAPIIntegration';

const AdvancedFeatures = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const features = [
    {
      id: 'analytics',
      title: 'Analytics & Dashboard',
      description: 'Visualize métricas, tendências e estatísticas do seu consultório',
      icon: <BarChart3 className="h-8 w-8" />,
      color: 'bg-blue-500',
      component: <DashboardAnalytics />
    },
    {
      id: 'notifications',
      title: 'Central de Notificações',
      description: 'Gerencie alertas, lembretes e notificações importantes',
      icon: <Bell className="h-8 w-8" />,
      color: 'bg-yellow-500',
      component: <NotificationCenter />
    },
    {
      id: 'search',
      title: 'Busca Avançada',
      description: 'Encontre rapidamente pacientes, consultas e informações',
      icon: <Search className="h-8 w-8" />,
      color: 'bg-green-500',
      component: <AdvancedSearch />
    },
    {
      id: 'templates',
      title: 'Templates de Consulta',
      description: 'Crie e gerencie modelos para agilizar suas consultas',
      icon: <FileText className="h-8 w-8" />,
      color: 'bg-purple-500',
      component: <ConsultationTemplates />
    },
    {
      id: 'integrations',
      title: 'Integrações Externas',
      description: 'Conecte-se com APIs para enriquecer suas funcionalidades',
      icon: <Globe className="h-8 w-8" />,
      color: 'bg-indigo-500',
      component: <ExternalAPIIntegration />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Funcionalidades Avançadas</h1>
              <p className="text-gray-600">Ferramentas profissionais para otimizar seu consultório</p>
            </div>
          </div>

          {/* Feature Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            {features.map((feature) => (
              <Card 
                key={feature.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  activeTab === feature.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setActiveTab(feature.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg text-white ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {features.map((feature) => (
              <TabsTrigger key={feature.id} value={feature.id} className="flex items-center gap-2">
                <span className="hidden sm:inline">{feature.icon}</span>
                <span className="text-xs sm:text-sm">{feature.title.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg text-white ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {feature.component}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Produtividade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">+23%</span>
                <span className="text-sm text-gray-500">este mês</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tempo Economizado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">2.5h</span>
                <span className="text-sm text-gray-500">por dia</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Automação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">85%</span>
                <span className="text-sm text-gray-500">das tarefas</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;
