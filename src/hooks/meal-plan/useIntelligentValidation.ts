/**
 * INTELLIGENT VALIDATION HOOK
 * Hook para validação de planos alimentares
 * Refatorado para usar validação local em vez do IntelligenceService obsoleto
 */

import { useState, useEffect, useMemo } from 'react';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { useToast } from '@/hooks/use-toast';

export interface ValidationWarning {
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface MealPlanValidation {
  isValid: boolean;
  score: number;
  warnings: ValidationWarning[];
  suggestions: string[];
  strengths: string[];
}

interface Targets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

/**
 * Validação local do plano alimentar baseada em regras nutricionais
 */
const validatePlanLocally = (
  mealPlan: ConsolidatedMealPlan,
  targets: Targets
): MealPlanValidation => {
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  // Calcula totais do plano
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  const meals = mealPlan.meals || [];
  let mealsWithItems = 0;

  meals.forEach((meal: any) => {
    const items = meal.foods || meal.items || [];
    if (items.length > 0) {
      mealsWithItems++;
    }
    items.forEach((item: any) => {
      totals.calories += item.calories || item.kcal_calculado || 0;
      totals.protein += item.protein || item.ptn_g_calculado || 0;
      totals.carbs += item.carbs || item.cho_g_calculado || 0;
      totals.fats += item.fat || item.lip_g_calculado || 0;
    });
  });

  // Validação 1: Calorias totais
  const calorieDiff = Math.abs(totals.calories - targets.calories);
  const caloriePercent = (calorieDiff / targets.calories) * 100;

  if (caloriePercent > 20) {
    warnings.push({
      severity: 'high',
      message: `Calorias ${totals.calories > targets.calories ? 'acima' : 'abaixo'} da meta (${Math.round(totals.calories)} / ${targets.calories} kcal)`,
    });
    score -= 20;
  } else if (caloriePercent > 10) {
    warnings.push({
      severity: 'medium',
      message: `Calorias ${totals.calories > targets.calories ? 'ligeiramente acima' : 'ligeiramente abaixo'} da meta`,
    });
    score -= 10;
  } else {
    strengths.push('Calorias dentro da meta');
  }

  // Validação 2: Proteínas
  const proteinDiff = Math.abs(totals.protein - targets.protein);
  const proteinPercent = (proteinDiff / targets.protein) * 100;

  if (proteinPercent > 25) {
    warnings.push({
      severity: 'high',
      message: `Proteínas ${totals.protein > targets.protein ? 'acima' : 'abaixo'} da meta`,
    });
    score -= 15;
    if (totals.protein < targets.protein) {
      suggestions.push('Adicione mais fontes de proteína como frango, peixe ou ovos');
    }
  } else if (proteinPercent <= 10) {
    strengths.push('Proteínas adequadas');
  }

  // Validação 3: Distribuição de refeições
  if (mealsWithItems < 3) {
    warnings.push({
      severity: 'medium',
      message: 'Poucas refeições preenchidas - considere distribuir em mais refeições',
    });
    score -= 10;
    suggestions.push('Distribua os alimentos em pelo menos 4-5 refeições ao longo do dia');
  } else if (mealsWithItems >= 5) {
    strengths.push('Boa distribuição de refeições ao longo do dia');
  }

  // Validação 4: Variedade de alimentos
  const totalItems = meals.reduce((sum: number, meal: any) => {
    const items = meal.foods || meal.items || [];
    return sum + items.length;
  }, 0);

  if (totalItems < 8) {
    suggestions.push('Considere adicionar mais variedade de alimentos');
  } else if (totalItems >= 12) {
    strengths.push('Boa variedade de alimentos');
  }

  // Validação 5: Carboidratos
  const carbDiff = Math.abs(totals.carbs - targets.carbs);
  const carbPercent = (carbDiff / targets.carbs) * 100;

  if (carbPercent > 25) {
    warnings.push({
      severity: 'medium',
      message: `Carboidratos ${totals.carbs > targets.carbs ? 'acima' : 'abaixo'} da meta`,
    });
    score -= 10;
  }

  // Validação 6: Gorduras
  const fatDiff = Math.abs(totals.fats - targets.fats);
  const fatPercent = (fatDiff / targets.fats) * 100;

  if (fatPercent > 25) {
    warnings.push({
      severity: 'medium',
      message: `Gorduras ${totals.fats > targets.fats ? 'acima' : 'abaixo'} da meta`,
    });
    score -= 10;
  }

  // Garantir score mínimo
  score = Math.max(score, 0);

  return {
    isValid: score >= 60 && warnings.filter(w => w.severity === 'high').length === 0,
    score,
    warnings,
    suggestions,
    strengths,
  };
};

export const useIntelligentValidation = (
  mealPlan: ConsolidatedMealPlan | null,
  targets?: Targets
) => {
  const { toast } = useToast();
  const [autoValidate, setAutoValidate] = useState(false);

  // Validação calculada localmente (memoizada)
  const validation = useMemo<MealPlanValidation | null>(() => {
    if (!mealPlan || !targets) return null;
    return validatePlanLocally(mealPlan, targets);
  }, [mealPlan, targets]);

  // Auto-notificação quando habilitada
  useEffect(() => {
    if (autoValidate && validation) {
      const highSeverityWarnings = validation.warnings.filter(w => w.severity === 'high');
      if (highSeverityWarnings.length > 0) {
        toast({
          title: "Atenção: Validação encontrou problemas",
          description: `${highSeverityWarnings.length} problema(s) de alta severidade`,
          variant: "destructive",
        });
      }
    }
  }, [autoValidate, validation, toast]);

  return {
    validation,
    isValidating: false, // Validação é síncrona agora
    validate: () => validation, // Retorna validação atual
    autoValidate,
    setAutoValidate,
  };
};
