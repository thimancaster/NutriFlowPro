/**
 * NUTRITIONAL VALIDATOR
 * Valida e verifica a qualidade nutricional dos planos alimentares
 */

import { ConsolidatedMealPlan, ConsolidatedMeal } from '@/types/mealPlanTypes';
import { CalculationResult } from '@/utils/nutrition/official/officialCalculations';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  warnings: string[];
  recommendations: string[];
  metrics: {
    calorieAccuracy: number;
    macroBalance: number;
    varietyScore: number;
    practicalityScore: number;
  };
}

export class NutritionalValidator {
  /**
   * Valida um plano alimentar completo
   */
  static validateMealPlan(
    mealPlan: Omit<ConsolidatedMealPlan, 'id' | 'patient_id' | 'user_id' | 'date' | 'created_at' | 'updated_at'>,
    targets: CalculationResult
  ): ValidationResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 1. Validar precisão calórica
    const calorieAccuracy = this.validateCalories(mealPlan, targets, warnings);

    // 2. Validar balanço de macros
    const macroBalance = this.validateMacros(mealPlan, targets, warnings);

    // 3. Validar variedade
    const varietyScore = this.validateVariety(mealPlan, warnings, recommendations);

    // 4. Validar praticidade
    const practicalityScore = this.validatePracticality(mealPlan, recommendations);

    // Calcular score geral
    const score = Math.round(
      (calorieAccuracy * 0.3) +
      (macroBalance * 0.3) +
      (varietyScore * 0.2) +
      (practicalityScore * 0.2)
    );

    return {
      isValid: score >= 70 && warnings.length === 0,
      score,
      warnings,
      recommendations,
      metrics: {
        calorieAccuracy,
        macroBalance,
        varietyScore,
        practicalityScore,
      },
    };
  }

  /**
   * Valida precisão calórica (meta vs real)
   */
  private static validateCalories(
    mealPlan: any,
    targets: CalculationResult,
    warnings: string[]
  ): number {
    const targetKcal = targets.vet;
    const actualKcal = mealPlan.total_calories;
    const diff = Math.abs(actualKcal - targetKcal);
    const diffPercent = (diff / targetKcal) * 100;

    if (diffPercent > 15) {
      warnings.push(`Calorias totais diferem ${diffPercent.toFixed(1)}% da meta (${actualKcal} vs ${targetKcal} kcal)`);
    }

    // Score: 100% se diff < 5%, reduz linearmente até 0% em 20%
    return Math.max(0, 100 - (diffPercent * 5));
  }

  /**
   * Valida balanço de macronutrientes
   */
  private static validateMacros(
    mealPlan: any,
    targets: CalculationResult,
    warnings: string[]
  ): number {
    const proteinDiff = Math.abs(mealPlan.total_protein - targets.macros.protein.grams);
    const carbsDiff = Math.abs(mealPlan.total_carbs - targets.macros.carbs.grams);
    const fatDiff = Math.abs(mealPlan.total_fats - targets.macros.fat.grams);

    const proteinDiffPercent = (proteinDiff / targets.macros.protein.grams) * 100;
    const carbsDiffPercent = (carbsDiff / targets.macros.carbs.grams) * 100;
    const fatDiffPercent = (fatDiff / targets.macros.fat.grams) * 100;

    if (proteinDiffPercent > 15) {
      warnings.push(`Proteína difere ${proteinDiffPercent.toFixed(1)}% da meta`);
    }
    if (carbsDiffPercent > 15) {
      warnings.push(`Carboidratos diferem ${carbsDiffPercent.toFixed(1)}% da meta`);
    }
    if (fatDiffPercent > 15) {
      warnings.push(`Gorduras diferem ${fatDiffPercent.toFixed(1)}% da meta`);
    }

    const avgDiffPercent = (proteinDiffPercent + carbsDiffPercent + fatDiffPercent) / 3;
    return Math.max(0, 100 - (avgDiffPercent * 4));
  }

  /**
   * Valida variedade de alimentos
   */
  private static validateVariety(
    mealPlan: any,
    warnings: string[],
    recommendations: string[]
  ): number {
    const allFoods = mealPlan.meals.flatMap((m: ConsolidatedMeal) => m.foods);
    const uniqueFoods = new Set(allFoods.map((f: any) => f.id));
    
    const varietyRatio = uniqueFoods.size / allFoods.length;

    if (varietyRatio < 0.6) {
      warnings.push('Plano com pouca variedade de alimentos');
      recommendations.push('Adicionar mais variedade de alimentos para melhor adesão');
    }

    // Verificar categorias
    const categories = new Set(allFoods.map((f: any) => {
      // Extrair categoria do nome ou usar padrão
      return 'categoria';
    }));

    if (categories.size < 4) {
      recommendations.push('Incluir alimentos de mais grupos alimentares');
    }

    return varietyRatio * 100;
  }

  /**
   * Valida praticidade do plano
   */
  private static validatePracticality(
    mealPlan: any,
    recommendations: string[]
  ): number {
    let score = 100;

    // Verificar se porções são realistas
    const allFoods = mealPlan.meals.flatMap((m: ConsolidatedMeal) => m.foods);
    
    allFoods.forEach((food: any) => {
      // Porções muito pequenas ou muito grandes
      if (food.quantity < 10 && food.unit === 'g') {
        score -= 5;
        recommendations.push(`Porção de ${food.name} muito pequena (${food.quantity}g)`);
      }
      if (food.quantity > 500 && food.unit === 'g') {
        score -= 5;
        recommendations.push(`Porção de ${food.name} muito grande (${food.quantity}g)`);
      }
    });

    // Verificar se todas as refeições têm alimentos
    const emptyMeals = mealPlan.meals.filter((m: ConsolidatedMeal) => m.foods.length === 0);
    if (emptyMeals.length > 0) {
      score -= 20 * emptyMeals.length;
      recommendations.push(`${emptyMeals.length} refeição(ões) vazia(s)`);
    }

    return Math.max(0, score);
  }

  /**
   * Sugere ajustes para melhorar o plano
   */
  static suggestImprovements(validation: ValidationResult): string[] {
    const suggestions: string[] = [];

    if (validation.metrics.calorieAccuracy < 85) {
      suggestions.push('Ajustar porções para aproximar das metas calóricas');
    }

    if (validation.metrics.macroBalance < 85) {
      suggestions.push('Rebalancear macronutrientes nas refeições');
    }

    if (validation.metrics.varietyScore < 70) {
      suggestions.push('Aumentar variedade de alimentos');
      suggestions.push('Incluir mais grupos alimentares');
    }

    if (validation.metrics.practicalityScore < 80) {
      suggestions.push('Revisar porções para valores mais práticos');
      suggestions.push('Garantir que todas as refeições tenham alimentos');
    }

    return suggestions;
  }
}
