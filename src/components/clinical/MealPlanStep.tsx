/**
 * MEAL PLAN STEP - REDIRECT TO UNIFIED MEAL PLAN BUILDER
 * 
 * Este componente exibe um resumo dos cálculos nutricionais e redireciona
 * para o MealPlanBuilder unificado para edição do plano alimentar.
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Utensils, 
  AlertCircle, 
  ArrowRight, 
  Edit, 
  Sparkles,
  Calculator,
  Target
} from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useQueryClient } from '@tanstack/react-query';
import { getFoodCategories, getPopularFoods } from '@/services/enhancedFoodSearchService';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Helper to safely extract number from macro (handles both objects and numbers)
const getMacroNumber = (v: any): number => {
  if (!v) return 0;
  if (typeof v === 'object' && 'grams' in v) return v.grams ?? 0;
  if (typeof v === 'number') return v;
  return 0;
};

const MealPlanStep: React.FC = () => {
  const navigate = useNavigate();
  const { consultationData } = useConsultationData();
  const { activePatient } = usePatient();
  const queryClient = useQueryClient();

  // Prefetch data for MealPlanBuilder when this component mounts
  useEffect(() => {
    // Prefetch categories and popular foods for faster MealPlanBuilder load
    queryClient.prefetchQuery({
      queryKey: ['food-categories'],
      queryFn: getFoodCategories,
      staleTime: 1000 * 60 * 60, // 1 hour
    });
    queryClient.prefetchQuery({
      queryKey: ['popular-foods'],
      queryFn: () => getPopularFoods(30),
      staleTime: 1000 * 60 * 60, // 1 hour
    });
  }, [queryClient]);

  const handleOpenMealPlanBuilder = () => {
    navigate('/meal-plan-builder');
  };

  if (!consultationData?.results?.vet) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Complete o cálculo nutricional primeiro</p>
          <p className="text-sm text-muted-foreground mt-2">
            Os dados de VET e macronutrientes são necessários para criar um plano alimentar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { vet, macros } = consultationData.results;
  const ptnG = getMacroNumber(macros.protein);
  const choG = getMacroNumber(macros.carbs);
  const lipG = getMacroNumber(macros.fat);

  // Calculate percentages
  const ptnKcal = ptnG * 4;
  const choKcal = choG * 4;
  const lipKcal = lipG * 9;
  const totalKcal = ptnKcal + choKcal + lipKcal;

  const ptnPercent = (ptnKcal / totalKcal) * 100;
  const choPercent = (choKcal / totalKcal) * 100;
  const lipPercent = (lipKcal / totalKcal) * 100;

  // Check if there's already a meal plan in context
  const existingPlan = consultationData?.mealPlan;
  const hasSavedPlan = existingPlan && existingPlan.refeicoes?.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Plano Alimentar - {activePatient?.name || 'Paciente'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Nutritional Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200/50 dark:border-orange-800/30"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">VET</p>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{Math.round(vet)}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">kcal/dia</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border border-red-200/50 dark:border-red-800/30"
            >
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Proteína</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{Math.round(ptnG)}g</p>
              <p className="text-xs text-red-600 dark:text-red-400">{ptnPercent.toFixed(0)}% do VET</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200/50 dark:border-amber-800/30"
            >
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Carboidratos</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{Math.round(choG)}g</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">{choPercent.toFixed(0)}% do VET</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/30"
            >
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Gorduras</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{Math.round(lipG)}g</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{lipPercent.toFixed(0)}% do VET</p>
            </motion.div>
          </div>

          {/* Macro Distribution Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Distribuição de Macronutrientes</span>
              <span>{Math.round(totalKcal)} kcal total</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex bg-muted">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${ptnPercent}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-red-500 h-full"
                title={`Proteína: ${ptnPercent.toFixed(1)}%`}
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${choPercent}%` }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-amber-500 h-full"
                title={`Carboidratos: ${choPercent.toFixed(1)}%`}
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${lipPercent}%` }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-blue-500 h-full"
                title={`Gorduras: ${lipPercent.toFixed(1)}%`}
              />
            </div>
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>PTN {ptnPercent.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>CHO {choPercent.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>LIP {lipPercent.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Existing Plan Status */}
          {hasSavedPlan && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
            >
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Plano em andamento
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {existingPlan.refeicoes.length} refeições configuradas
                </p>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                Rascunho
              </Badge>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleOpenMealPlanBuilder}
              size="lg"
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            >
              <Edit className="h-5 w-5 mr-2" />
              {hasSavedPlan ? 'Continuar Editando' : 'Criar Plano Alimentar'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            O editor completo permite adicionar alimentos, gerar automaticamente com IA, 
            arrastar e soltar, e exportar em PDF.
          </p>
        </CardContent>
      </Card>

      {/* Quick Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Cálculos Salvos</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Os valores de VET e macros serão usados como metas no plano alimentar. 
                Você pode ajustar a distribuição por refeição no editor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanStep;
