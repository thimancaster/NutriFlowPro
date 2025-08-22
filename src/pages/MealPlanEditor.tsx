
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MealPlanService } from '@/services/mealPlanService';
import { DetailedMealPlan, MealPlanMeal, MealPlanFood, ConsolidatedMealPlan } from '@/types/mealPlan';
import MealPlanForm from '@/components/MealPlanForm';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Pencil, Save } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const MealPlanEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mealPlan, setMealPlan] = useState<DetailedMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMealPlan = async () => {
      if (id) {
        setIsLoading(true);
        const fetchedMealPlan = await MealPlanService.getMealPlanById(id);
        if (fetchedMealPlan) {
          // Convert ConsolidatedMealPlan to DetailedMealPlan
          const detailedMealPlan: DetailedMealPlan = {
            ...fetchedMealPlan,
            day_of_week: fetchedMealPlan.day_of_week || 0,
            meals: fetchedMealPlan.meals.map(meal => ({
              ...meal,
              foods: meal.items.map(item => ({
                id: item.id,
                food_id: item.food_id,
                name: item.food_name || item.name || '',
                quantity: item.quantity,
                unit: item.unit,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fats: item.fats
              })),
              items: meal.items.map(item => ({
                id: item.id,
                food_id: item.food_id,
                name: item.food_name || item.name || '',
                quantity: item.quantity,
                unit: item.unit,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fats: item.fats
              }))
            }))
          };
          setMealPlan(detailedMealPlan);
        } else {
          toast({
            title: "Erro ao carregar o plano alimentar",
            description: "Plano alimentar não encontrado.",
            variant: "destructive",
          });
          navigate('/meal-plans');
        }
        setIsLoading(false);
      }
    };

    fetchMealPlan();
  }, [id, navigate, toast]);

  const handleMealPlanUpdate = useCallback((updatedMealPlan: ConsolidatedMealPlan) => {
    // Convert ConsolidatedMealPlan to DetailedMealPlan for compatibility
    const detailedMealPlan: DetailedMealPlan = {
      ...updatedMealPlan,
      day_of_week: updatedMealPlan.day_of_week || 0,
      meals: updatedMealPlan.meals.map(meal => ({
        ...meal,
        foods: meal.items.map(item => ({
          id: item.id,
          food_id: item.food_id,
          name: item.food_name || item.name || '',
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats
        })),
        items: meal.items.map(item => ({
          id: item.id,
          food_id: item.food_id,
          name: item.food_name || item.name || '',
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats
        }))
      }))
    };
    
    setMealPlan(detailedMealPlan);
  }, []);

  const handleSave = async (updatedMealPlan: ConsolidatedMealPlan) => {
    setIsLoading(true);
    try {
      if (id) {
        const result = await MealPlanService.updateMealPlan(id, updatedMealPlan);
        if (result.success && result.data) {
          toast({
            title: "Plano alimentar atualizado",
            description: "O plano alimentar foi atualizado com sucesso.",
          });
          handleMealPlanUpdate(result.data);
          setIsEditing(false);
        } else {
          toast({
            title: "Erro ao atualizar o plano alimentar",
            description: result.error || "Ocorreu um erro ao salvar o plano alimentar.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar o plano alimentar",
        description: error.message || "Ocorreu um erro ao salvar o plano alimentar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClick = async () => {
    if (mealPlan) {
      // Convert DetailedMealPlan to ConsolidatedMealPlan
      const consolidatedMealPlan: ConsolidatedMealPlan = {
        ...mealPlan,
        meals: mealPlan.meals.map(meal => ({
          ...meal,
          items: meal.foods.map(food => ({
            id: food.id,
            food_id: food.food_id,
            food_name: food.name,
            meal_id: meal.id,
            name: food.name,
            quantity: food.quantity,
            unit: food.unit,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats
          }))
        }))
      };
      await handleSave(consolidatedMealPlan);
    }
  };

  if (isLoading) {
    return <div>Carregando plano alimentar...</div>;
  }

  if (!mealPlan) {
    return <div>Plano alimentar não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton to="/meal-plans" />
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Plano
          </Button>
        ) : (
          <Button onClick={handleSaveClick}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Plano
          </Button>
        )}
      </div>
      
      <MealPlanForm
        mealPlan={mealPlan}
        isEditing={isEditing}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    </div>
  );
};

export default MealPlanEditor;
