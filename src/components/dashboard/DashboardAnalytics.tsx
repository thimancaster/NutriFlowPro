
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalPatients: number;
  activePatients: number;
  consultationsThisMonth: number;
  consultationsGrowth: number;
  monthlyConsultations: Array<{ month: string; count: number }>;
  patientsByGender: Array<{ gender: string; count: number }>;
  goalDistribution: Array<{ goal: string; count: number }>;
}

const DashboardAnalytics: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get total and active patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id, status, gender, created_at')
        .eq('user_id', user.id);

      // Get consultations data
      const { data: consultations } = await supabase
        .from('calculations')
        .select('id, created_at, goal')
        .eq('user_id', user.id);

      const totalPatients = patients?.length || 0;
      const activePatients = patients?.filter(p => p.status === 'active').length || 0;

      // Calculate this month's consultations
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const consultationsThisMonth = consultations?.filter(c => 
        new Date(c.created_at) >= thisMonth
      ).length || 0;

      // Calculate growth (mock data for now)
      const consultationsGrowth = 12.5;

      // Monthly consultations data
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        const count = consultations?.filter(c => {
          const cDate = new Date(c.created_at);
          return cDate.getMonth() === date.getMonth() && cDate.getFullYear() === date.getFullYear();
        }).length || 0;
        monthlyData.push({ month: monthName, count });
      }

      // Gender distribution
      const genderCounts: Record<string, number> = {};
      patients?.forEach(p => {
        const gender = p.gender === 'male' ? 'Masculino' : 
                     p.gender === 'female' ? 'Feminino' : 'Outro';
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      });
      const patientsByGender = Object.entries(genderCounts).map(([gender, count]) => ({
        gender, count
      }));

      // Goal distribution
      const goalCounts: Record<string, number> = {};
      consultations?.forEach(c => {
        const goal = c.goal || 'Não especificado';
        goalCounts[goal] = (goalCounts[goal] || 0) + 1;
      });
      const goalDistribution = Object.entries(goalCounts).map(([goal, count]) => ({
        goal, count
      }));

      return {
        totalPatients,
        activePatients,
        consultationsThisMonth,
        consultationsGrowth,
        monthlyConsultations: monthlyData,
        patientsByGender,
        goalDistribution
      };
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.activePatients || 0} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.consultationsThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.consultationsGrowth || 0}% do mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{analytics?.consultationsGrowth || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Crescimento mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Atingidas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de sucesso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.monthlyConsultations || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Gênero</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.patientsByGender || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ gender, percent }) => `${gender} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics?.patientsByGender?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Objetivos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.goalDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="goal" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAnalytics;
