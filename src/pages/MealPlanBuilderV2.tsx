import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FoodSearchPanel } from '@/components/meal-plan/FoodSearchPanel';
import { MealContentPanel } from '@/components/meal-plan/MealContentPanel';
import { FloatingMealSummary } from '@/components/meal-plan/FloatingMealSummary';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { AlimentoV2 } from '@/services/enhancedFoodSearchService';
import type { MealItemData } from '@/components/meal-plan/MealItemCard';
import { checkIfNeedsSeed, seedEssentialFoods } from '@/utils/seedFoodsData';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  // Remove item from active meal
  const handleRemoveItem = (itemIndex: number) => {
    setMeals((prev) => {
      const updated = [...prev];
      const meal = { ...updated[activeMealIndex] };
      const removedItem = meal.items[itemIndex];

      meal.items = meal.items.filter((_, i) => i !== itemIndex);
      meal.kcal_total -= removedItem.kcal_calculado;
      meal.ptn_g -= removedItem.ptn_g_calculado;
      meal.cho_g -= removedItem.cho_g_calculado;
      meal.lip_g -= removedItem.lip_g_calculado;

      updated[activeMealIndex] = meal;
      return updated;
    });
  };

  // Edit item quantity in active meal
  const handleEditItem = (itemIndex: number, newQuantity: number) => {
    setMeals((prev) => {
      const updated = [...prev];
      const meal = { ...updated[activeMealIndex] };
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
      updated[activeMealIndex] = meal;
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

  // Calculate totals for header
  const totals = meals.reduce(
    (acc, meal) => ({
      kcal: acc.kcal + meal.kcal_total,
      ptn: acc.ptn + meal.ptn_g,
      cho: acc.cho + meal.cho_g,
      lip: acc.lip + meal.lip_g,
    }),
    { kcal: 0, ptn: 0, cho: 0, lip: 0 }
  );

  const progressPercent = targets ? (totals.kcal / targets.kcal) * 100 : 0;

  return (
    <div className="container mx-auto p-4 lg:p-6 min-h-screen flex flex-col">
      {/* Sticky Header with Progress */}
      <div className="sticky top-0 z-40 bg-background pb-4 space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/calculator')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Construtor de Plano Alimentar</h1>
              <p className="text-sm text-muted-foreground">
                Selecione a refeição e adicione os alimentos
              </p>
            </div>
          </div>
        </div>

        {/* Daily Progress Bar */}
        {targets && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso Diário</span>
              <div className="flex items-center gap-4">
                <span className="font-semibold">
                  {Math.round(totals.kcal)} / {Math.round(targets.kcal)} kcal
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span>P: <span className="font-semibold">{totals.ptn.toFixed(0)}g</span></span>
                  <span>C: <span className="font-semibold">{totals.cho.toFixed(0)}g</span></span>
                  <span>G: <span className="font-semibold">{totals.lip.toFixed(0)}g</span></span>
                </div>
              </div>
            </div>
            <Progress 
              value={Math.min(progressPercent, 100)} 
              className={cn(
                "h-2",
                progressPercent > 110 && "bg-destructive/20"
              )}
            />
          </motion.div>
        )}
      </div>

      {/* Meal Tabs */}
      <Tabs 
        value={meals[activeMealIndex].id} 
        onValueChange={(value) => {
          const index = meals.findIndex(m => m.id === value);
          if (index !== -1) setActiveMealIndex(index);
        }}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-start overflow-x-auto mb-4">
          {meals.map((meal) => {
            const hasItems = meal.items.length > 0;
            return (
              <TabsTrigger
                key={meal.id}
                value={meal.id}
                className="relative flex items-center gap-2"
              >
                <span>{meal.nome_refeicao}</span>
                {hasItems && (
                  <Badge variant="secondary" className="h-5 min-w-5 flex items-center justify-center">
                    {meal.items.length}
                  </Badge>
                )}
                {/* Status Indicator */}
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full transition-colors',
                    hasItems ? 'bg-primary' : 'bg-transparent'
                  )}
                />
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content - Two Panel Layout */}
        {meals.map((meal, index) => (
          <TabsContent 
            key={meal.id} 
            value={meal.id}
            className="flex-1 mt-0 data-[state=active]:flex data-[state=inactive]:hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr] gap-6 h-[calc(100vh-280px)]">
              {/* Left Panel: Food Search */}
              <div className="h-full">
                <FoodSearchPanel
                  onFoodSelect={handleFoodSelect}
                  activeMealType={meal.tipo}
                />
              </div>

              {/* Right Panel: Meal Content */}
              <div className="h-full">
                <MealContentPanel
                  activeMeal={meal}
                  onRemoveItem={handleRemoveItem}
                  onEditItem={handleEditItem}
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Floating Summary */}
      <FloatingMealSummary
        meals={meals}
        targets={targets}
      />
    </div>
  );
};

export default MealPlanBuilderV2;
