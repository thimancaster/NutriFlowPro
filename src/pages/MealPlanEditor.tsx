
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download, Print } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MealPlanServiceV3 } from '@/services/mealPlan/MealPlanServiceV3';
import { ConsolidatedMealPlan, MealPlanFood } from '@/types/mealPlanTypes';
import ConsolidatedMealPlanEditor from '@/components/meal-plan/ConsolidatedMealPlanEditor';

const MealPlanEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mealPlan, setMealPlan] = useState<ConsolidatedMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadMealPlan(id);
    }
  }, [id]);

  const loadMealPlan = async (planId: string) => {
    try {
      setIsLoading(true);
      const result = await MealPlanServiceV3.getMealPlanById(planId);
      
      if (result.success && result.data) {
        // Convert MealPlanItem to MealPlanFood for editor compatibility
        const convertedPlan: ConsolidatedMealPlan = {
          ...result.data,
          meals: result.data.meals.map(meal => ({
            ...meal,
            foods: meal.items.map(item => ({
              id: item.id,
              food_id: item.food_id,
              name: item.name || 'Item sem nome', // MealPlanItem uses 'name', not 'food_name'
              quantity: item.quantity,
              unit: item.unit,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fats: item.fats
            } as MealPlanFood)),
            items: meal.items.map(item => ({
              id: item.id,
              food_id: item.food_id,
              name: item.name || 'Item sem nome', // MealPlanItem uses 'name', not 'food_name'
              quantity: item.quantity,
              unit: item.unit,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fats: item.fats
            }))
          }))
        };
        
        setMealPlan(convertedPlan);
      } else {
        throw new Error(result.error || 'Erro ao carregar plano');
      }
    } catch (error: any) {
      console.error('Erro ao carregar plano:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar plano alimentar',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedPlan: ConsolidatedMealPlan) => {
    if (!id) return;
    
    try {
      setIsSaving(true);
      const result = await MealPlanServiceV3.updateMealPlan(id, updatedPlan);
      
      if (result.success && result.data) {
        setMealPlan(result.data);
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar salvo com sucesso!'
        });
      } else {
        throw new Error(result.error || 'Erro ao salvar plano');
      }
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar plano alimentar',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Carregando plano alimentar...</p>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Plano alimentar não encontrado</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <ConsolidatedMealPlanEditor
        mealPlan={mealPlan}
        patientName="Paciente"
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default MealPlanEditor;
