/**
 * AUTO GENERATION SERVICE
 * Gera planos alimentares automaticamente com inteligência cultural brasileira
 */

import { AlimentoServiceUnified } from './AlimentoServiceUnified';
import { ConsolidatedMealPlan, ConsolidatedMeal, MealType, MEAL_TYPES, MEAL_TIMES, DEFAULT_MEAL_DISTRIBUTION } from '@/types/mealPlanTypes';
import { CalculationResult } from '@/utils/nutrition/official/officialCalculations';

interface MacroTargets {
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
}

export class AutoGenerationService {
  /**
   * Gera um plano alimentar completo automaticamente
   */
  static async generateMealPlan(
    calculationResults: CalculationResult,
    patientData?: any
  ): Promise<Omit<ConsolidatedMealPlan, 'id' | 'patient_id' | 'user_id' | 'date' | 'created_at' | 'updated_at'>> {
    try {
      console.log('🤖 AutoGen: Iniciando geração automática...');

      // 1. Extrair metas nutricionais
      const targets: MacroTargets = {
        kcal: calculationResults.vet,
        protein_g: calculationResults.macros.protein.grams,
        carb_g: calculationResults.macros.carbs.grams,
        fat_g: calculationResults.macros.fat.grams,
      };

      console.log('🎯 Metas:', targets);

      // 2. Distribuir metas por refeição
      const mealDistribution = this.distributeMealTargets(targets);
      console.log('📊 Distribuição:', mealDistribution);

      // 3. Gerar cada refeição
      const meals: ConsolidatedMeal[] = [];
      
      for (const [mealType, mealTargets] of Object.entries(mealDistribution)) {
        console.log(`🍽️ Gerando ${mealType}...`);
        
        const meal = await this.generateMeal(
          mealType as MealType,
          mealTargets,
          patientData
        );
        
        meals.push(meal);
      }

      // 4. Calcular totais
      const totals = this.calculateTotals(meals);

      const plan = {
        name: 'Plano Automático',
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fats: totals.fats,
        meals,
        notes: 'Plano gerado automaticamente com base nas metas nutricionais calculadas.',
      };

      console.log('✅ AutoGen: Plano gerado com sucesso!');
      return plan;
      
    } catch (error) {
      console.error('❌ AutoGen: Erro na geração', error);
      throw error;
    }
  }

  /**
   * Distribui metas nutricionais por refeição
   */
  private static distributeMealTargets(targets: MacroTargets): Record<MealType, MacroTargets> {
    const distribution: Record<MealType, MacroTargets> = {} as any;

    for (const [mealType, percentage] of Object.entries(DEFAULT_MEAL_DISTRIBUTION)) {
      const factor = percentage / 100;
      distribution[mealType as MealType] = {
        kcal: Math.round(targets.kcal * factor),
        protein_g: Math.round(targets.protein_g * factor * 10) / 10,
        carb_g: Math.round(targets.carb_g * factor * 10) / 10,
        fat_g: Math.round(targets.fat_g * factor * 10) / 10,
      };
    }

    return distribution;
  }

  /**
   * Gera uma refeição específica
   */
  private static async generateMeal(
    mealType: MealType,
    targets: MacroTargets,
    patientData?: any
  ): Promise<ConsolidatedMeal> {
    try {
      // 1. Buscar alimentos culturalmente apropriados
      const foods = await AlimentoServiceUnified.getCulturallyAppropriate(mealType);
      
      if (foods.length === 0) {
        console.warn(`⚠️ Nenhum alimento encontrado para ${mealType}`);
        return this.createEmptyMeal(mealType);
      }

      // 2. Selecionar alimentos e calcular porções
      const selectedFoods = this.selectFoodsForMeal(foods, targets, mealType);

      // 3. Calcular totais
      const totalCalories = selectedFoods.reduce((sum, f) => sum + f.calories, 0);
      const totalProtein = selectedFoods.reduce((sum, f) => sum + f.protein, 0);
      const totalCarbs = selectedFoods.reduce((sum, f) => sum + f.carbs, 0);
      const totalFats = selectedFoods.reduce((sum, f) => sum + f.fat, 0);

      return {
        id: `meal_${mealType}`,
        name: MEAL_TYPES[mealType],
        type: mealType,
        time: MEAL_TIMES[mealType],
        foods: selectedFoods,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fats: totalFats,
      };
      
    } catch (error) {
      console.error(`❌ Erro ao gerar ${mealType}`, error);
      return this.createEmptyMeal(mealType);
    }
  }

  /**
   * Seleciona alimentos e calcula porções otimizadas
   */
  private static selectFoodsForMeal(
    availableFoods: any[],
    targets: MacroTargets,
    mealType: MealType
  ): any[] {
    const selected: any[] = [];
    let remainingKcal = targets.kcal;

    // Estratégia por tipo de refeição
    const strategy = this.getMealStrategy(mealType);

    for (const category of strategy.categories) {
      const foodsInCategory = availableFoods.filter(f => 
        f.tipo_refeicao_sugerida?.includes(mealType) &&
        f.categoria === category
      );

      if (foodsInCategory.length === 0) continue;

      // Selecionar alimento aleatório da categoria
      const food = foodsInCategory[Math.floor(Math.random() * foodsInCategory.length)];

      // Calcular porção baseada nas calorias restantes
      const portionFactor = Math.min(
        strategy.portionLimits[category] || 1,
        remainingKcal / food.kcal_por_referencia
      );

      if (portionFactor <= 0) continue;

      const quantity = Math.round(food.peso_referencia_g * portionFactor);
      const actualFactor = quantity / food.peso_referencia_g;

      const selectedFood = {
        id: food.id,
        name: food.nome,
        quantity,
        unit: 'g',
        calories: Math.round(food.kcal_por_referencia * actualFactor),
        protein: Math.round(food.ptn_g_por_referencia * actualFactor * 10) / 10,
        carbs: Math.round(food.cho_g_por_referencia * actualFactor * 10) / 10,
        fat: Math.round(food.lip_g_por_referencia * actualFactor * 10) / 10,
      };

      selected.push(selectedFood);
      remainingKcal -= selectedFood.calories;

      if (remainingKcal <= 50) break; // Margem de 50 kcal
    }

    return selected;
  }

  /**
   * Define estratégia de seleção de alimentos por tipo de refeição
   */
  private static getMealStrategy(mealType: MealType): {
    categories: string[];
    portionLimits: Record<string, number>;
  } {
    const strategies: Record<MealType, any> = {
      breakfast: {
        categories: ['Cereais e derivados', 'Leite e derivados', 'Frutas'],
        portionLimits: { 'Cereais e derivados': 2, 'Leite e derivados': 1.5, 'Frutas': 1 }
      },
      morning_snack: {
        categories: ['Frutas', 'Oleaginosas'],
        portionLimits: { 'Frutas': 1, 'Oleaginosas': 0.5 }
      },
      lunch: {
        categories: ['Carnes e ovos', 'Cereais e derivados', 'Leguminosas', 'Hortaliças'],
        portionLimits: { 'Carnes e ovos': 1.5, 'Cereais e derivados': 2, 'Leguminosas': 1, 'Hortaliças': 2 }
      },
      afternoon_snack: {
        categories: ['Frutas', 'Leite e derivados'],
        portionLimits: { 'Frutas': 1, 'Leite e derivados': 1 }
      },
      dinner: {
        categories: ['Carnes e ovos', 'Cereais e derivados', 'Hortaliças'],
        portionLimits: { 'Carnes e ovos': 1, 'Cereais e derivados': 1.5, 'Hortaliças': 2 }
      },
      evening_snack: {
        categories: ['Leite e derivados', 'Frutas'],
        portionLimits: { 'Leite e derivados': 1, 'Frutas': 0.5 }
      }
    };

    return strategies[mealType] || { categories: [], portionLimits: {} };
  }

  /**
   * Cria uma refeição vazia
   */
  private static createEmptyMeal(mealType: MealType): ConsolidatedMeal {
    return {
      id: `meal_${mealType}`,
      name: MEAL_TYPES[mealType],
      type: mealType,
      time: MEAL_TIMES[mealType],
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0,
    };
  }

  /**
   * Calcula totais do plano
   */
  private static calculateTotals(meals: ConsolidatedMeal[]) {
    return {
      calories: meals.reduce((sum, m) => sum + m.totalCalories, 0),
      protein: meals.reduce((sum, m) => sum + m.totalProtein, 0),
      carbs: meals.reduce((sum, m) => sum + m.totalCarbs, 0),
      fats: meals.reduce((sum, m) => sum + m.totalFats, 0),
    };
  }
}
