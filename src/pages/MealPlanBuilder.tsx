/**
 * MEAL PLAN BUILDER - CONSTRUTOR UNIFICADO DE PLANOS ALIMENTARES
 * 
 * Este é o ÚNICO ponto de entrada para criação e edição de planos alimentares.
 * Consolida todas as funcionalidades anteriores em uma interface única.
 * 
 * Modos:
 * - Edição Manual: Busca e adiciona alimentos manualmente
 * - Geração Automática: Usa AutoGenerationService para preencher refeições
 * - Preview/Exportação: Visualiza e exporta o plano
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Wand2, 
  Edit, 
  Eye, 
  Save, 
  FileDown, 
  Printer,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMealPlanCalculations, Refeicao, ItemRefeicao, AlimentoV2 } from '@/hooks/useMealPlanCalculations';
import { useMealPlanExport } from '@/hooks/useMealPlanExport';
import { AutoGenerationService, PatientProfile } from '@/services/mealPlan/AutoGenerationService';
import { MealPlanOrchestrator } from '@/services/mealPlan/MealPlanOrchestrator';
import { FoodSearchPanel } from '@/components/meal-plan/FoodSearchPanel';
import { MealContentPanel } from '@/components/meal-plan/MealContentPanel';
import { FloatingMealSummary } from '@/components/meal-plan/FloatingMealSummary';
import { SaveTemplateDialog } from '@/components/meal-plan/SaveTemplateDialog';
import { TemplatesPicker } from '@/components/meal-plan/TemplatesPicker';
import { MealTemplateItem } from '@/hooks/meal-plan/useMealPlanTemplates';
import { checkIfNeedsSeed, seedEssentialFoods } from '@/utils/seedFoodsData';
import { cn } from '@/lib/utils';

// Distribuição padrão de calorias por refeição (%)
const DISTRIBUICAO_PADRAO = [0.25, 0.10, 0.30, 0.10, 0.20, 0.05];

const REFEICOES_TEMPLATE = [
  { id: 'cafe_manha', nome: 'Café da Manhã', tipo: 'cafe_manha', horario_sugerido: '07:00' },
  { id: 'lanche_manha', nome: 'Lanche da Manhã', tipo: 'lanche_manha', horario_sugerido: '10:00' },
  { id: 'almoco', nome: 'Almoço', tipo: 'almoco', horario_sugerido: '12:30' },
  { id: 'lanche_tarde', nome: 'Lanche da Tarde', tipo: 'lanche_tarde', horario_sugerido: '15:30' },
  { id: 'jantar', nome: 'Jantar', tipo: 'jantar', horario_sugerido: '19:00' },
  { id: 'ceia', nome: 'Ceia', tipo: 'ceia', horario_sugerido: '21:30' },
];

// Helper para extrair número de macros
const getMacroNumber = (v: any): number => {
  if (!v) return 0;
  if (typeof v === 'object' && 'grams' in v) return v.grams ?? 0;
  if (typeof v === 'number') return v;
  return 0;
};

interface MealItem {
  id: string;
  alimento_id: string;
  nome: string;
  quantidade: number;
  medida_utilizada: string;
  peso_total_g: number;
  kcal_calculado: number;
  ptn_g_calculado: number;
  cho_g_calculado: number;
  lip_g_calculado: number;
}

interface Meal {
  id: string;
  nome_refeicao: string;
  tipo: string;
  horario_sugerido?: string;
  items: MealItem[];
  kcal_total: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
  alvo_kcal: number;
  alvo_ptn_g: number;
  alvo_cho_g: number;
  alvo_lip_g: number;
}

const MealPlanBuilder: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { consultationData, updateConsultationData } = useConsultationData();
  const { activePatient } = usePatient();
  const { user } = useAuth();
  const { exportToPDF, printMealPlan } = useMealPlanExport();
  const { calculateItemRefeicao, calculateDailyTotals } = useMealPlanCalculations();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'edit' | 'auto' | 'preview'>('edit');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);

  // Targets from consultation data
  const hasCalculations = consultationData?.results?.vet && consultationData?.results?.macros;
  
  const targets = hasCalculations ? {
    kcal: consultationData.results.vet,
    ptn_g: getMacroNumber(consultationData.results.macros.protein),
    cho_g: getMacroNumber(consultationData.results.macros.carbs),
    lip_g: getMacroNumber(consultationData.results.macros.fat),
  } : undefined;

  // Initialize meals with targets from VET
  useEffect(() => {
    if (targets && meals.length === 0) {
      const initialMeals: Meal[] = REFEICOES_TEMPLATE.map((template, idx) => ({
        id: template.id,
        nome_refeicao: template.nome,
        tipo: template.tipo,
        horario_sugerido: template.horario_sugerido,
        items: [],
        kcal_total: 0,
        ptn_g: 0,
        cho_g: 0,
        lip_g: 0,
        alvo_kcal: Math.round(targets.kcal * DISTRIBUICAO_PADRAO[idx]),
        alvo_ptn_g: Math.round(targets.ptn_g * DISTRIBUICAO_PADRAO[idx]),
        alvo_cho_g: Math.round(targets.cho_g * DISTRIBUICAO_PADRAO[idx]),
        alvo_lip_g: Math.round(targets.lip_g * DISTRIBUICAO_PADRAO[idx]),
      }));
      setMeals(initialMeals);
    }
  }, [targets, meals.length]);

  // Check and seed database if needed
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const needsSeed = await checkIfNeedsSeed();
        if (needsSeed) {
          setIsSeeding(true);
          await seedEssentialFoods();
          toast({
            title: 'Banco de dados inicializado',
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

  // Load existing meal plan if editing
  useEffect(() => {
    if (planId) {
      loadExistingPlan(planId);
    }
  }, [planId]);

  const loadExistingPlan = async (id: string) => {
    try {
      const plan = await MealPlanOrchestrator.getMealPlan(id);
      if (plan && plan.meals) {
        // Convert to local format
        const loadedMeals: Meal[] = (plan.meals as any[]).map((m: any, idx: number) => ({
          id: m.id || `meal_${idx}`,
          nome_refeicao: m.name || m.nome_refeicao || REFEICOES_TEMPLATE[idx]?.nome || 'Refeição',
          tipo: m.type || m.tipo || REFEICOES_TEMPLATE[idx]?.tipo || 'almoco',
          horario_sugerido: m.time || m.horario_sugerido || REFEICOES_TEMPLATE[idx]?.horario_sugerido,
          items: (m.foods || m.items || []).map((f: any) => ({
            id: f.id || crypto.randomUUID(),
            alimento_id: f.id || f.alimento_id || '',
            nome: f.name || f.nome || f.alimento_nome || '',
            quantidade: f.quantity || f.quantidade || 1,
            medida_utilizada: f.unit || f.medida_utilizada || 'g',
            peso_total_g: f.quantity || f.peso_total_g || 0,
            kcal_calculado: f.calories || f.kcal_calculado || 0,
            ptn_g_calculado: f.protein || f.ptn_g_calculado || 0,
            cho_g_calculado: f.carbs || f.cho_g_calculado || 0,
            lip_g_calculado: f.fat || f.lip_g_calculado || 0,
          })),
          kcal_total: m.totalCalories || m.total_calories || 0,
          ptn_g: m.totalProtein || m.total_protein || 0,
          cho_g: m.totalCarbs || m.total_carbs || 0,
          lip_g: m.totalFats || m.total_fats || 0,
          alvo_kcal: Math.round((targets?.kcal || 2000) * DISTRIBUICAO_PADRAO[idx]),
          alvo_ptn_g: Math.round((targets?.ptn_g || 100) * DISTRIBUICAO_PADRAO[idx]),
          alvo_cho_g: Math.round((targets?.cho_g || 250) * DISTRIBUICAO_PADRAO[idx]),
          alvo_lip_g: Math.round((targets?.lip_g || 70) * DISTRIBUICAO_PADRAO[idx]),
        }));
        setMeals(loadedMeals);
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
      toast({
        title: 'Erro ao carregar plano',
        description: 'Não foi possível carregar o plano alimentar.',
        variant: 'destructive',
      });
    }
  };

  // Add food to active meal
  const handleFoodSelect = useCallback((food: AlimentoV2, quantity: number) => {
    const newItem: MealItem = {
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

    setHasUnsavedChanges(true);
    toast({
      title: 'Alimento adicionado',
      description: `${food.nome} adicionado ao ${meals[activeMealIndex]?.nome_refeicao}`,
    });
  }, [activeMealIndex, meals, toast]);

  // Remove item from active meal
  const handleRemoveItem = useCallback((itemIndex: number) => {
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
    setHasUnsavedChanges(true);
  }, [activeMealIndex]);

  // Edit item quantity
  const handleEditItem = useCallback((itemIndex: number, newQuantity: number) => {
    setMeals((prev) => {
      const updated = [...prev];
      const meal = { ...updated[activeMealIndex] };
      const item = { ...meal.items[itemIndex] };
      
      const oldQuantity = item.quantidade;
      const multiplier = newQuantity / oldQuantity;

      const oldKcal = item.kcal_calculado;
      const oldPtn = item.ptn_g_calculado;
      const oldCho = item.cho_g_calculado;
      const oldLip = item.lip_g_calculado;

      item.quantidade = newQuantity;
      item.peso_total_g = Math.round(item.peso_total_g * multiplier);
      item.kcal_calculado *= multiplier;
      item.ptn_g_calculado *= multiplier;
      item.cho_g_calculado *= multiplier;
      item.lip_g_calculado *= multiplier;

      meal.kcal_total += item.kcal_calculado - oldKcal;
      meal.ptn_g += item.ptn_g_calculado - oldPtn;
      meal.cho_g += item.cho_g_calculado - oldCho;
      meal.lip_g += item.lip_g_calculado - oldLip;

      meal.items[itemIndex] = item;
      updated[activeMealIndex] = meal;
      return updated;
    });
    setHasUnsavedChanges(true);
  }, [activeMealIndex]);

  // Auto generate meal plan
  const handleAutoGenerate = useCallback(async () => {
    if (!activePatient?.id) {
      toast({
        title: 'Erro',
        description: 'Paciente não identificado',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Convert to Refeicao format for AutoGenerationService
      const refeicoes: Refeicao[] = meals.map((meal, idx) => ({
        nome: meal.nome_refeicao,
        numero: idx + 1,
        horario_sugerido: meal.horario_sugerido,
        itens: [],
        alvo_kcal: meal.alvo_kcal,
        alvo_ptn_g: meal.alvo_ptn_g,
        alvo_cho_g: meal.alvo_cho_g,
        alvo_lip_g: meal.alvo_lip_g,
      }));

      const profile: PatientProfile = {
        objective: consultationData?.objective || 'manutencao',
        restrictions: [],
        gender: activePatient?.gender || 'male'
      };

      const generatedRefeicoes = await AutoGenerationService.generatePlan(refeicoes, profile);

      // Convert back to Meal format
      const newMeals: Meal[] = generatedRefeicoes.map((ref, idx) => {
        const items: MealItem[] = ref.itens.map(item => ({
          id: item.id || crypto.randomUUID(),
          alimento_id: item.alimento_id,
          nome: item.alimento_nome,
          quantidade: item.quantidade,
          medida_utilizada: item.medida_utilizada,
          peso_total_g: item.peso_total_g,
          kcal_calculado: item.kcal_calculado,
          ptn_g_calculado: item.ptn_g_calculado,
          cho_g_calculado: item.cho_g_calculado,
          lip_g_calculado: item.lip_g_calculado,
        }));

        const totals = items.reduce((acc, item) => ({
          kcal: acc.kcal + item.kcal_calculado,
          ptn: acc.ptn + item.ptn_g_calculado,
          cho: acc.cho + item.cho_g_calculado,
          lip: acc.lip + item.lip_g_calculado,
        }), { kcal: 0, ptn: 0, cho: 0, lip: 0 });

        return {
          id: REFEICOES_TEMPLATE[idx].id,
          nome_refeicao: ref.nome,
          tipo: REFEICOES_TEMPLATE[idx].tipo,
          horario_sugerido: ref.horario_sugerido,
          items,
          kcal_total: totals.kcal,
          ptn_g: totals.ptn,
          cho_g: totals.cho,
          lip_g: totals.lip,
          alvo_kcal: ref.alvo_kcal,
          alvo_ptn_g: ref.alvo_ptn_g,
          alvo_cho_g: ref.alvo_cho_g,
          alvo_lip_g: ref.alvo_lip_g,
        };
      });

      setMeals(newMeals);
      setHasUnsavedChanges(true);
      setActiveTab('edit');
      
      toast({
        title: 'Plano gerado com sucesso',
        description: 'Revise as refeições e ajuste conforme necessário.',
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: 'Erro ao gerar plano',
        description: 'Não foi possível gerar o plano automaticamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [meals, activePatient, consultationData, toast]);

  // Save meal plan
  const handleSave = useCallback(async () => {
    if (!user?.id || !activePatient?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário ou paciente não identificado.',
        variant: 'destructive',
      });
      return;
    }

    const totalItems = meals.reduce((sum, meal) => sum + meal.items.length, 0);
    if (totalItems === 0) {
      toast({
        title: 'Plano vazio',
        description: 'Adicione alimentos ao plano antes de salvar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const totals = meals.reduce((acc, meal) => ({
        kcal: acc.kcal + meal.kcal_total,
        ptn: acc.ptn + meal.ptn_g,
        cho: acc.cho + meal.cho_g,
        lip: acc.lip + meal.lip_g,
      }), { kcal: 0, ptn: 0, cho: 0, lip: 0 });

      const planData = {
        id: planId || crypto.randomUUID(),
        patient_id: activePatient.id,
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        name: `Plano Alimentar - ${activePatient.name}`,
        total_calories: Math.round(totals.kcal),
        total_protein: Math.round(totals.ptn * 10) / 10,
        total_carbs: Math.round(totals.cho * 10) / 10,
        total_fats: Math.round(totals.lip * 10) / 10,
        meals: meals.map(meal => ({
          id: meal.id,
          name: meal.nome_refeicao,
          type: meal.tipo as any,
          time: meal.horario_sugerido,
          foods: meal.items.map(item => ({
            id: item.alimento_id,
            name: item.nome,
            quantity: item.peso_total_g,
            unit: 'g',
            calories: Math.round(item.kcal_calculado),
            protein: Math.round(item.ptn_g_calculado * 10) / 10,
            carbs: Math.round(item.cho_g_calculado * 10) / 10,
            fat: Math.round(item.lip_g_calculado * 10) / 10,
          })),
          totalCalories: Math.round(meal.kcal_total),
          totalProtein: Math.round(meal.ptn_g * 10) / 10,
          totalCarbs: Math.round(meal.cho_g * 10) / 10,
          totalFats: Math.round(meal.lip_g * 10) / 10,
          total_calories: Math.round(meal.kcal_total),
          total_protein: Math.round(meal.ptn_g * 10) / 10,
          total_carbs: Math.round(meal.cho_g * 10) / 10,
          total_fats: Math.round(meal.lip_g * 10) / 10,
        })),
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await MealPlanOrchestrator.saveMealPlan(planData as any);
      
      // Update context
      updateConsultationData({
        mealPlan: {
          refeicoes: meals.map(m => ({
            nome: m.nome_refeicao,
            numero: REFEICOES_TEMPLATE.findIndex(t => t.id === m.id) + 1,
            horario_sugerido: m.horario_sugerido,
            itens: m.items.map(i => ({
              alimento_id: i.alimento_id,
              alimento_nome: i.nome,
              quantidade: i.quantidade,
              medida_utilizada: i.medida_utilizada,
              peso_total_g: i.peso_total_g,
              kcal_calculado: i.kcal_calculado,
              ptn_g_calculado: i.ptn_g_calculado,
              cho_g_calculado: i.cho_g_calculado,
              lip_g_calculado: i.lip_g_calculado,
            })),
            alvo_kcal: m.alvo_kcal,
            alvo_ptn_g: m.alvo_ptn_g,
            alvo_cho_g: m.alvo_cho_g,
            alvo_lip_g: m.alvo_lip_g,
          })),
          dailyTotals: {
            kcal: totals.kcal,
            ptn_g: totals.ptn,
            cho_g: totals.cho,
            lip_g: totals.lip,
          },
        },
      });

      setHasUnsavedChanges(false);
      toast({
        title: 'Plano salvo com sucesso',
        description: `${meals.length} refeições e ${totalItems} alimentos salvos.`,
      });
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o plano alimentar.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [meals, user, activePatient, planId, updateConsultationData, toast]);

  // Export to PDF
  const handleExportPDF = useCallback(async () => {
    if (!activePatient) return;

    const refeicoes: Refeicao[] = meals.map((meal, idx) => ({
      nome: meal.nome_refeicao,
      numero: idx + 1,
      horario_sugerido: meal.horario_sugerido,
      itens: meal.items.map(i => ({
        alimento_id: i.alimento_id,
        alimento_nome: i.nome,
        quantidade: i.quantidade,
        medida_utilizada: i.medida_utilizada,
        peso_total_g: i.peso_total_g,
        kcal_calculado: i.kcal_calculado,
        ptn_g_calculado: i.ptn_g_calculado,
        cho_g_calculado: i.cho_g_calculado,
        lip_g_calculado: i.lip_g_calculado,
      })),
      alvo_kcal: meal.alvo_kcal,
      alvo_ptn_g: meal.alvo_ptn_g,
      alvo_cho_g: meal.alvo_cho_g,
      alvo_lip_g: meal.alvo_lip_g,
    }));

    await exportToPDF({
      refeicoes,
      patientName: activePatient.name,
      patientAge: activePatient.age,
      patientGender: activePatient.gender === 'male' ? 'male' : activePatient.gender === 'female' ? 'female' : undefined,
      nutritionistName: user?.email || undefined,
      notes: consultationData?.notes,
    });
  }, [meals, activePatient, user, consultationData, exportToPDF]);

  // Print meal plan
  const handlePrint = useCallback(async () => {
    if (!activePatient) return;

    const refeicoes: Refeicao[] = meals.map((meal, idx) => ({
      nome: meal.nome_refeicao,
      numero: idx + 1,
      horario_sugerido: meal.horario_sugerido,
      itens: meal.items.map(i => ({
        alimento_id: i.alimento_id,
        alimento_nome: i.nome,
        quantidade: i.quantidade,
        medida_utilizada: i.medida_utilizada,
        peso_total_g: i.peso_total_g,
        kcal_calculado: i.kcal_calculado,
        ptn_g_calculado: i.ptn_g_calculado,
        cho_g_calculado: i.cho_g_calculado,
        lip_g_calculado: i.lip_g_calculado,
      })),
      alvo_kcal: meal.alvo_kcal,
      alvo_ptn_g: meal.alvo_ptn_g,
      alvo_cho_g: meal.alvo_cho_g,
      alvo_lip_g: meal.alvo_lip_g,
    }));

    await printMealPlan({
      refeicoes,
      patientName: activePatient.name,
      patientAge: activePatient.age,
      patientGender: activePatient.gender === 'male' ? 'male' : activePatient.gender === 'female' ? 'female' : undefined,
      nutritionistName: user?.email || undefined,
      notes: consultationData?.notes,
    });
  }, [meals, activePatient, user, consultationData, printMealPlan]);

  // Loading state
  if (isSeeding) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto animate-pulse text-primary" />
          <h3 className="text-lg font-semibold">Inicializando banco de dados...</h3>
          <p className="text-sm text-muted-foreground">Adicionando alimentos essenciais</p>
        </div>
      </div>
    );
  }

  // No calculations state
  if (!hasCalculations) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            É necessário completar os cálculos nutricionais antes de gerar o plano alimentar.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/calculator')} className="w-full mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a Calculadora
        </Button>
      </div>
    );
  }

  // Calculate totals
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

  // Convert meals to format expected by MealContentPanel
  const activeMeal = meals[activeMealIndex] ? {
    id: meals[activeMealIndex].id,
    nome_refeicao: meals[activeMealIndex].nome_refeicao,
    tipo: meals[activeMealIndex].tipo,
    horario_sugerido: meals[activeMealIndex].horario_sugerido,
    items: meals[activeMealIndex].items.map(item => ({
      id: item.id,
      alimento_id: item.alimento_id,
      nome: item.nome,
      quantidade: item.quantidade,
      medida_utilizada: item.medida_utilizada,
      peso_total_g: item.peso_total_g,
      kcal_calculado: item.kcal_calculado,
      ptn_g_calculado: item.ptn_g_calculado,
      cho_g_calculado: item.cho_g_calculado,
      lip_g_calculado: item.lip_g_calculado,
    })),
    kcal_total: meals[activeMealIndex].kcal_total,
    ptn_g: meals[activeMealIndex].ptn_g,
    cho_g: meals[activeMealIndex].cho_g,
    lip_g: meals[activeMealIndex].lip_g,
  } : null;

  return (
    <div className="container mx-auto p-4 lg:p-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background pb-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Plano Alimentar</h1>
              <p className="text-sm text-muted-foreground">
                {activePatient?.name || 'Paciente'} • {planId ? 'Editando' : 'Novo Plano'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSaveTemplateDialog(true)}
              disabled={meals[activeMealIndex]?.items.length === 0}
              title="Salvar refeição como template"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              disabled={totals.kcal === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPDF}
              disabled={totals.kcal === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving || totals.kcal === 0}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
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

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="w-full max-w-md mx-auto mb-4">
          <TabsTrigger value="edit" className="flex-1 gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="auto" className="flex-1 gap-2">
            <Wand2 className="h-4 w-4" />
            Auto Gerar
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1 gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Edit Mode */}
        <TabsContent value="edit" className="flex-1 mt-0">
          {/* Meal Tabs */}
          <Tabs 
            value={meals[activeMealIndex]?.id || ''} 
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
                <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr] gap-6 h-[calc(100vh-320px)]">
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
                      activeMeal={activeMeal}
                      onRemoveItem={handleRemoveItem}
                      onEditItem={handleEditItem}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* Auto Generation Mode */}
        <TabsContent value="auto" className="flex-1 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
            {/* Left Panel: Templates */}
            <div className="h-[calc(100vh-320px)] overflow-auto">
              <TemplatesPicker
                targets={targets ? {
                  kcal: targets.kcal,
                  ptn_g: targets.ptn_g,
                  cho_g: targets.cho_g,
                  lip_g: targets.lip_g
                } : undefined}
                onSelectTemplate={(items) => {
                  // Aplica items do template à refeição ativa
                  setMeals((prev) => {
                    const updated = [...prev];
                    const meal = { ...updated[activeMealIndex] };
                    
                    const newItems: MealItem[] = items.map(item => ({
                      id: `item-${Date.now()}-${Math.random()}`,
                      alimento_id: item.alimento_id,
                      nome: item.alimento_nome,
                      quantidade: item.quantidade,
                      medida_utilizada: item.medida_utilizada,
                      peso_total_g: item.peso_total_g,
                      kcal_calculado: item.kcal,
                      ptn_g_calculado: item.ptn_g,
                      cho_g_calculado: item.cho_g,
                      lip_g_calculado: item.lip_g,
                    }));
                    
                    // Adiciona items e recalcula totais
                    meal.items = [...meal.items, ...newItems];
                    meal.kcal_total = meal.items.reduce((sum, i) => sum + i.kcal_calculado, 0);
                    meal.ptn_g = meal.items.reduce((sum, i) => sum + i.ptn_g_calculado, 0);
                    meal.cho_g = meal.items.reduce((sum, i) => sum + i.cho_g_calculado, 0);
                    meal.lip_g = meal.items.reduce((sum, i) => sum + i.lip_g_calculado, 0);
                    
                    updated[activeMealIndex] = meal;
                    return updated;
                  });
                  
                  setHasUnsavedChanges(true);
                  setActiveTab('edit');
                  toast({
                    title: 'Template aplicado',
                    description: `${items.length} alimentos adicionados à ${meals[activeMealIndex]?.nome_refeicao}`,
                  });
                }}
                mealType={meals[activeMealIndex]?.tipo}
              />
            </div>

            {/* Right Panel: Auto Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Geração Automática de Plano Alimentar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    O sistema irá preencher automaticamente as refeições vazias com alimentos 
                    apropriados, respeitando as metas calóricas e de macronutrientes definidas.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Meta Calórica</p>
                    <p className="text-2xl font-bold">{targets?.kcal} kcal</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Proteínas</p>
                    <p className="text-2xl font-bold">{targets?.ptn_g}g</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Carboidratos</p>
                    <p className="text-2xl font-bold">{targets?.cho_g}g</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Gorduras</p>
                    <p className="text-2xl font-bold">{targets?.lip_g}g</p>
                  </Card>
                </div>

                <Button 
                  onClick={handleAutoGenerate} 
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Gerando Plano...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5 mr-2" />
                      Gerar Plano Automático
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Mode */}
        <TabsContent value="preview" className="flex-1 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Visualização do Plano Alimentar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totals.kcal === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Adicione alimentos ao plano para visualizar o preview</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Calorias</p>
                      <p className="text-2xl font-bold text-primary">{Math.round(totals.kcal)} kcal</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Proteínas</p>
                      <p className="text-2xl font-bold">{totals.ptn.toFixed(1)}g</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Carboidratos</p>
                      <p className="text-2xl font-bold">{totals.cho.toFixed(1)}g</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Gorduras</p>
                      <p className="text-2xl font-bold">{totals.lip.toFixed(1)}g</p>
                    </Card>
                  </div>

                  {/* Meals List */}
                  <div className="space-y-4">
                    {meals.map((meal) => (
                      <Card key={meal.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{meal.nome_refeicao}</h3>
                            <Badge variant="outline">{meal.horario_sugerido}</Badge>
                          </div>
                          <Badge variant="secondary">
                            {Math.round(meal.kcal_total)} kcal
                          </Badge>
                        </div>
                        
                        {meal.items.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">Nenhum alimento adicionado</p>
                        ) : (
                          <ul className="space-y-1 text-sm">
                            {meal.items.map((item) => (
                              <li key={item.id} className="flex justify-between">
                                <span>{item.quantidade}x {item.medida_utilizada} de {item.nome}</span>
                                <span className="text-muted-foreground">{Math.round(item.kcal_calculado)} kcal</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* Export Buttons */}
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                    <Button onClick={handleExportPDF}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Summary */}
      <FloatingMealSummary
        meals={meals}
        targets={targets}
      />

      {/* Save Template Dialog */}
      <SaveTemplateDialog
        open={showSaveTemplateDialog}
        onOpenChange={setShowSaveTemplateDialog}
        mealType={meals[activeMealIndex]?.tipo || 'almoco'}
        mealName={meals[activeMealIndex]?.nome_refeicao || 'Refeição'}
        items={meals[activeMealIndex]?.items.map(i => ({
          alimento_id: i.alimento_id,
          alimento_nome: i.nome,
          quantidade: i.quantidade,
          medida_utilizada: i.medida_utilizada,
          peso_total_g: i.peso_total_g,
          kcal: i.kcal_calculado,
          ptn_g: i.ptn_g_calculado,
          cho_g: i.cho_g_calculado,
          lip_g: i.lip_g_calculado,
        })) || []}
      />
    </div>
  );
};

export default MealPlanBuilder;
