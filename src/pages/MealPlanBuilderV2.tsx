import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { FoodSearchPanel } from '@/components/meal-plan/FoodSearchPanel';
import { MealPlanPanel } from '@/components/meal-plan/MealPlanPanel';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { AlimentoV2 } from '@/services/enhancedFoodSearchService';
import type { MealItemData } from '@/components/meal-plan/MealItemCard';
import { checkIfNeedsSeed, seedEssentialFoods } from '@/utils/seedFoodsData';

interface Meal {
  id: string;
  nome_refeicao: string;
  tipo: string;
  horario_sugerido?: string;
  items: MealItemData[];
  kcal_total: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
}

const DEFAULT_MEALS: Meal[] = [
  {
    id: 'cafe_manha',
    nome_refeicao: 'Café da Manhã',
    tipo: 'cafe_manha',
    horario_sugerido: '07:00',
    items: [],
    kcal_total: 0,
    ptn_g: 0,
    cho_g: 0,
    lip_g: 0,
  },
  {
    id: 'lanche_manha',
    nome_refeicao: 'Lanche da Manhã',
    tipo: 'lanche_manha',
    horario_sugerido: '10:00',
    items: [],
    kcal_total: 0,
    ptn_g: 0,
    cho_g: 0,
    lip_g: 0,
  },
  {
    id: 'almoco',
    nome_refeicao: 'Almoço',
    tipo: 'almoco',
    horario_sugerido: '12:30',
    items: [],
    kcal_total: 0,
    ptn_g: 0,
    cho_g: 0,
    lip_g: 0,
  },
  {
    id: 'lanche_tarde',
    nome_refeicao: 'Lanche da Tarde',
    tipo: 'lanche_tarde',
    horario_sugerido: '15:30',
    items: [],
    kcal_total: 0,
    ptn_g: 0,
    cho_g: 0,
    lip_g: 0,
  },
  {
    id: 'jantar',
    nome_refeicao: 'Jantar',
    tipo: 'jantar',
    horario_sugerido: '19:00',
    items: [],
    kcal_total: 0,
    ptn_g: 0,
    cho_g: 0,
    lip_g: 0,
  },
  {
    id: 'ceia',
    nome_refeicao: 'Ceia',
    tipo: 'ceia',
    horario_sugerido: '21:30',
    items: [],
    kcal_total: 0,
    ptn_g: 0,
    cho_g: 0,
    lip_g: 0,
  },
];

/**
 * MealPlanBuilderV2 - Redesigned meal plan builder
 * Sprint 2 implementation: Two-panel layout with quick-add functionality
 */
const MealPlanBuilderV2: React.FC = () => {
  const { consultationData } = useConsultationData();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);

  // Check and seed database if needed
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const needsSeed = await checkIfNeedsSeed();
        if (needsSeed) {
          setIsSeeding(true);
          await seedEssentialFoods();
          toast({
            title: '✅ Banco de dados inicializado',
            description: 'Alimentos essenciais foram adicionados',
          });
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setIsSeeding(false);
      }
    };

    initializeDatabase();
  }, [toast]);

  // Check if we have the required calculation data
  const hasCalculations =
    consultationData?.results?.vet && consultationData?.results?.macros;

  const targets = hasCalculations
    ? {
        kcal: consultationData.results.vet,
        ptn_g: consultationData.results.macros.protein,
        cho_g: consultationData.results.macros.carbs,
        lip_g: consultationData.results.macros.fat,
      }
    : undefined;

  // Add food to active meal
  const handleFoodSelect = (food: AlimentoV2, quantity: number) => {
    const newItem: MealItemData = {
      id: `item-${Date.now()}-${Math.random()}`,
      alimento_id: food.id,
      nome: food.nome,
      quantidade: quantity,
      medida_utilizada: food.medida_padrao_referencia,
      peso_total_g: Math.round(food.peso_referencia_g * quantity),
      kcal_calculado: food.kcal_por_referencia * quantity,
      ptn_g_calculado: food.ptn_g_por_referencia * quantity,
      cho_g_calculado: food.cho_g_por_referencia * quantity,
      lip_g_calculado: food.lip_g_por_referencia * quantity,
    };

    setMeals((prev) => {
      const updated = [...prev];
      const meal = { ...updated[activeMealIndex] };
      meal.items = [...meal.items, newItem];
      meal.kcal_total += newItem.kcal_calculado;
      meal.ptn_g += newItem.ptn_g_calculado;
      meal.cho_g += newItem.cho_g_calculado;
      meal.lip_g += newItem.lip_g_calculado;
      updated[activeMealIndex] = meal;
      return updated;
    });

    toast({
      title: '✅ Alimento adicionado',
      description: `${food.nome} foi adicionado ao ${meals[activeMealIndex].nome_refeicao}`,
    });
  };

  // Remove item from meal
  const handleRemoveItem = (mealIndex: number, itemIndex: number) => {
    setMeals((prev) => {
      const updated = [...prev];
      const meal = { ...updated[mealIndex] };
      const removedItem = meal.items[itemIndex];

      meal.items = meal.items.filter((_, i) => i !== itemIndex);
      meal.kcal_total -= removedItem.kcal_calculado;
      meal.ptn_g -= removedItem.ptn_g_calculado;
      meal.cho_g -= removedItem.cho_g_calculado;
      meal.lip_g -= removedItem.lip_g_calculado;

      updated[mealIndex] = meal;
      return updated;
    });
  };

  // Edit item quantity
  const handleEditItem = (
    mealIndex: number,
    itemIndex: number,
    newQuantity: number
  ) => {
    setMeals((prev) => {
      const updated = [...prev];
      const meal = { ...updated[mealIndex] };
      const item = { ...meal.items[itemIndex] };
      
      const oldQuantity = item.quantidade;
      const multiplier = newQuantity / oldQuantity;

      // Update item
      item.quantidade = newQuantity;
      item.peso_total_g = Math.round(item.peso_total_g * multiplier);
      item.kcal_calculado *= multiplier;
      item.ptn_g_calculado *= multiplier;
      item.cho_g_calculado *= multiplier;
      item.lip_g_calculado *= multiplier;

      // Update meal totals
      const oldItem = meal.items[itemIndex];
      meal.kcal_total += item.kcal_calculado - oldItem.kcal_calculado;
      meal.ptn_g += item.ptn_g_calculado - oldItem.ptn_g_calculado;
      meal.cho_g += item.cho_g_calculado - oldItem.cho_g_calculado;
      meal.lip_g += item.lip_g_calculado - oldItem.lip_g_calculado;

      meal.items[itemIndex] = item;
      updated[mealIndex] = meal;
      return updated;
    });
  };

  if (!hasCalculations) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            É necessário completar os cálculos nutricionais antes de gerar o plano
            alimentar.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => navigate('/calculator')}
          className="w-full mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a Calculadora
        </Button>
      </div>
    );
  }

  if (isSeeding) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto animate-pulse text-primary" />
          <h3 className="text-lg font-semibold">Inicializando banco de dados...</h3>
          <p className="text-sm text-muted-foreground">
            Adicionando alimentos essenciais
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 h-screen flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/calculator')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Construtor de Plano Alimentar</h1>
          <p className="text-sm text-muted-foreground">
            Clique em um alimento para adicionar 1 porção ou ajuste a quantidade
          </p>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-hidden">
        {/* Left Panel: Food Search (40%) */}
        <div className="lg:col-span-2 h-full">
          <FoodSearchPanel
            onFoodSelect={handleFoodSelect}
            activeMealType={meals[activeMealIndex].tipo}
          />
        </div>

        {/* Right Panel: Meal Plan (60%) */}
        <div className="lg:col-span-3 h-full">
          <MealPlanPanel
            meals={meals}
            targets={targets}
            onRemoveItem={handleRemoveItem}
            onEditItem={handleEditItem}
            onMealActivate={setActiveMealIndex}
            activeMealIndex={activeMealIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default MealPlanBuilderV2;
