import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface TrendAnalysisProps {
  patientId?: string;
  timeRange?: 'week' | 'month' | 'quarter';
}

const TrendAnalysisDashboard: React.FC<TrendAnalysisProps> = ({
  patientId,
  timeRange = 'month'
}) => {
  const [nutritionTrends, setNutritionTrends] = useState<any[]>([]);
  const [foodCategories, setFoodCategories] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real implementation, this would come from actual meal plan history
  useEffect(() => {
    generateMockAnalytics();
  }, [patientId, timeRange]);

  const generateMockAnalytics = () => {
    // Mock nutrition trends over time
    const mockTrends = [
      { date: '2024-01', calories: 2200, protein: 120, carbs: 250, fats: 80 },
      { date: '2024-02', calories: 2150, protein: 125, carbs: 240, fats: 75 },
      { date: '2024-03', calories: 2180, protein: 130, carbs: 245, fats: 78 },
      { date: '2024-04', calories: 2100, protein: 135, carbs: 230, fats: 72 },
      { date: '2024-05', calories: 2050, protein: 140, carbs: 220, fats: 70 },
      { date: '2024-06', calories: 2000, protein: 145, carbs: 210, fats: 68 }
    ];

    // Mock food category distribution
    const mockCategories = [
      { name: 'Proteínas', value: 30, color: '#8B5CF6' },
      { name: 'Carboidratos', value: 45, color: '#F59E0B' },
      { name: 'Gorduras', value: 25, color: '#10B981' }
    ];

    // Mock insights
    const mockInsights = [
      {
        type: 'improvement',
        title: 'Aumento de Proteína',
        description: 'Consumo de proteína aumentou 20% no último mês',
        trend: 'up'
      },
      {
        type: 'concern',
        title: 'Redução de Fibras',
        description: 'Consumo de fibras abaixo da meta nos últimos 7 dias',
        trend: 'down'
      },
      {
        type: 'success',
        title: 'Meta Calórica',
        description: 'Mantendo consistência nas calorias diárias',
        trend: 'stable'
      }
    ];

    setNutritionTrends(mockTrends);
    setFoodCategories(mockCategories);
    setInsights(mockInsights);
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'border-green-200 bg-green-50';
      case 'down': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className={`border ${getTrendColor(insight.trend)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{insight.title}</h3>
                {getTrendIcon(insight.trend)}
              </div>
              <p className="text-sm text-gray-600">{insight.description}</p>
              <Badge 
                variant="secondary" 
                className="mt-2 text-xs"
              >
                {insight.type === 'improvement' ? 'Melhoria' : 
                 insight.type === 'concern' ? 'Atenção' : 'Sucesso'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Nutrition Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tendências Nutricionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={nutritionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="calories" stroke="#3B82F6" name="Calorias" />
              <Line type="monotone" dataKey="protein" stroke="#EF4444" name="Proteína" />
              <Line type="monotone" dataKey="carbs" stroke="#F59E0B" name="Carboidratos" />
              <Line type="monotone" dataKey="fats" stroke="#10B981" name="Gorduras" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macronutrient Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição de Macronutrientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={foodCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {foodCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {foodCategories.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Progresso Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Meta Calórica</p>
                  <p className="text-xs text-gray-600">85% das metas atingidas</p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Excelente
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Variedade Alimentar</p>
                  <p className="text-xs text-gray-600">12 grupos alimentares</p>
                </div>
                <Badge variant="secondary">
                  Bom
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Sustentabilidade</p>
                  <p className="text-xs text-gray-600">Score médio: 7.2/10</p>
                </div>
                <Badge variant="outline">
                  Muito Bom
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrendAnalysisDashboard;
