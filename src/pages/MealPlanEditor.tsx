import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MealPlanService } from '@/services/mealPlanService';
import { DetailedMealPlan } from '@/types/mealPlan';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const MealPlanEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<DetailedMealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMealPlan();
    }
  }, [id]);

  const loadMealPlan = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const result = await MealPlanService.getMealPlan(id);
      
      if (result.success && result.data) {
        // Convert MealPlan to DetailedMealPlan
        const detailedMealPlan: DetailedMealPlan = {
          ...result.data,
          // Add any additional fields needed for DetailedMealPlan
        };
        setMealPlan(detailedMealPlan);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Plano alimentar não encontrado",
          variant: "destructive"
        });
        navigate('/meal-plans');
      }
    } catch (error: any) {
      console.error('Error loading meal plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar plano alimentar",
        variant: "destructive"
      });
      navigate('/meal-plans');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="text-center py-8">
        <p>Plano alimentar não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Editar Plano Alimentar</h1>
      {/* Add meal plan editing interface here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p>Editor do plano alimentar será implementado aqui</p>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify(mealPlan, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default MealPlanEditor;
