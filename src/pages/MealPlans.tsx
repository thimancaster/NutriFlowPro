
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Filter } from 'lucide-react';
import MealPlanList from '@/components/meal-plan/MealPlanList';
import { MealPlanFilters } from '@/types/mealPlan';

const MealPlans: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<MealPlanFilters>({});
  const [activeTab, setActiveTab] = useState('all');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const newFilters: MealPlanFilters = {};
    
    switch (value) {
      case 'templates':
        newFilters.isTemplate = true;
        break;
      case 'recent':
        newFilters.limit = 10;
        newFilters.date_from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0]; // Last 30 days
        break;
      case 'all':
      default:
        // No additional filters for 'all'
        break;
    }
    
    setFilters(newFilters);
  };

  const handleCreateNew = () => {
    navigate('/meal-plan-generator');
  };

  const handleEdit = (id: string) => {
    navigate(`/meal-plan-editor/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/meal-plan/${id}`);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Você precisa estar logado para acessar os planos alimentares.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planos Alimentares</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e visualize todos os seus planos alimentares
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <MealPlanList 
            filters={filters}
            onEdit={handleEdit}
            onView={handleView}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <MealPlanList 
            filters={filters}
            onEdit={handleEdit}
            onView={handleView}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <MealPlanList 
            filters={filters}
            onEdit={handleEdit}
            onView={handleView}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealPlans;
