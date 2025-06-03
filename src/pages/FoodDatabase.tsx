
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Search, TrendingUp, Award, Brain } from 'lucide-react';
import EnhancedFoodSearch from '@/components/food-database/EnhancedFoodSearch';
import FoodDetails from '@/components/food-database/FoodDetails';
import NutritionalAnalysis from '@/components/food-database/NutritionalAnalysis';
import RecommendationEngine from '@/components/food-database/RecommendationEngine';
import TrendAnalysisDashboard from '@/components/food-database/TrendAnalysisDashboard';
import GamificationSystem from '@/components/food-database/GamificationSystem';
import { useAuth } from '@/contexts/auth/AuthContext';

const FoodDatabase = () => {
  const { user } = useAuth();
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('search');

  const handleFoodSelect = (food: any) => {
    setSelectedFood(food);
  };

  const handleBackToSearch = () => {
    setSelectedFood(null);
  };

  // Mock patient profile for recommendations
  const mockPatientProfile = {
    age: 35,
    gender: 'female',
    activityLevel: 'moderate',
    goals: ['weight_loss', 'muscle_gain'],
    restrictions: ['lactose'],
    preferences: ['organic', 'sustainable']
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Helmet>
        <title>Base de Dados de Alimentos - NutriFlow Pro</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nutri-blue mb-2">
            Base de Dados de Alimentos
          </h1>
          <p className="text-gray-600">
            Sistema inteligente para busca, análise e recomendação de alimentos
          </p>
        </div>

        {selectedFood ? (
          <FoodDetails
            foodId={selectedFood.id}
            onBack={handleBackToSearch}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Busca Avançada
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Recomendações IA
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Análise de Tendências
              </TabsTrigger>
              <TabsTrigger value="gamification" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Gamificação
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Gestão de Dados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Busca Inteligente de Alimentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedFoodSearch 
                    onFoodSelect={handleFoodSelect}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <RecommendationEngine 
                patientProfile={mockPatientProfile}
                onFoodSelect={handleFoodSelect}
              />
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Dashboard de Análise de Tendências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendAnalysisDashboard 
                    patientId={user?.id}
                    timeRange="month"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gamification" className="space-y-6">
              <GamificationSystem 
                userId={user?.id || ''}
              />
            </TabsContent>

            <TabsContent value="database" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estatísticas Gerais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de Alimentos:</span>
                        <span className="font-semibold">2,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categorias:</span>
                        <span className="font-semibold">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Alimentos Orgânicos:</span>
                        <span className="font-semibold">384</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Última Atualização:</span>
                        <span className="font-semibold">Hoje</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Qualidade dos Dados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dados Completos:</span>
                        <span className="font-semibold text-green-600">94%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Com Análise Nutricional:</span>
                        <span className="font-semibold text-blue-600">87%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verificados:</span>
                        <span className="font-semibold text-purple-600">76%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm">
                        📊 Exportar Relatório
                      </button>
                      <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm">
                        🔄 Sincronizar Dados
                      </button>
                      <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm">
                        ➕ Adicionar Alimento
                      </button>
                      <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm">
                        🏷️ Gerenciar Categorias
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default FoodDatabase;
