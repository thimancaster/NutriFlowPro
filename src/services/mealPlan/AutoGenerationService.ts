/**
 * AUTO GENERATION SERVICE
 * Gera planos alimentares automaticamente com inteligência cultural brasileira
 */

import { AlimentoServiceUnified } from './AlimentoServiceUnified';
import { NutritionalValidator } from './NutritionalValidator';
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

      // 5. Validar qualidade nutricional
      const validation = NutritionalValidator.validateMealPlan(plan, calculationResults);
      
      console.log('📊 Validação:', {
        score: validation.score,
        isValid: validation.isValid,
        warnings: validation.warnings.length,
        recommendations: validation.recommendations.length
      });

      if (validation.warnings.length > 0) {
        console.warn('⚠️ Avisos:', validation.warnings);
      }

      if (validation.score < 80) {
        console.log('💡 Sugestões de melhoria:', NutritionalValidator.suggestImprovements(validation));
      }

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
   * Seleciona alimentos e calcula porções otimizadas com inteligência nutricional
   */
  private static selectFoodsForMeal(
    availableFoods: any[],
    targets: MacroTargets,
    mealType: MealType
  ): any[] {
    const selected: any[] = [];
    const strategy = this.getMealStrategy(mealType);

    // Rastrear macros acumulados
    let totalKcal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    // Selecionar alimentos por categoria respeitando prioridades
    for (const category of strategy.categories) {
      const foodsInCategory = availableFoods.filter(f => 
        f.tipo_refeicao_sugerida?.includes(mealType) &&
        f.categoria === category
      );

      if (foodsInCategory.length === 0) continue;

      // Ordenar por densidade nutricional
      const sortedFoods = foodsInCategory.sort((a, b) => {
        const scoreA = this.calculateNutritionalScore(a, targets);
        const scoreB = this.calculateNutritionalScore(b, targets);
        return scoreB - scoreA;
      });

      // Selecionar melhor alimento da categoria
      const food = sortedFoods[0];

      // Calcular porção baseada em:
      // 1. Calorias alvo
      // 2. Limite da categoria
      // 3. Balanço de macros
      const categoryTargetKcal = targets.kcal * (strategy.categoryWeights[category] || 0.3);
      const portionFactor = Math.min(
        strategy.portionLimits[category] || 1,
        categoryTargetKcal / food.kcal_por_referencia
      );

      if (portionFactor <= 0) continue;

      let quantity = Math.round(food.peso_referencia_g * portionFactor);
      
      // Ajustar para unidades mais práticas
      quantity = this.adjustToRealisticPortion(quantity, food.medida_padrao_referencia);

      const actualFactor = quantity / food.peso_referencia_g;

      const selectedFood = {
        id: food.id,
        name: food.nome,
        quantity,
        unit: food.medida_padrao_referencia || 'g',
        calories: Math.round(food.kcal_por_referencia * actualFactor),
        protein: Math.round(food.ptn_g_por_referencia * actualFactor * 10) / 10,
        carbs: Math.round(food.cho_g_por_referencia * actualFactor * 10) / 10,
        fat: Math.round(food.lip_g_por_referencia * actualFactor * 10) / 10,
      };

      selected.push(selectedFood);
      
      totalKcal += selectedFood.calories;
      totalProtein += selectedFood.protein;
      totalCarbs += selectedFood.carbs;
      totalFat += selectedFood.fat;
    }

    // Ajuste fino para aproximar das metas
    return this.fineTunePortions(selected, targets, { totalKcal, totalProtein, totalCarbs, totalFat });
  }

  /**
   * Calcula score nutricional de um alimento baseado nas metas
   */
  private static calculateNutritionalScore(food: any, targets: MacroTargets): number {
    // Densidade de proteína (importante para todos os objetivos)
    const proteinDensity = food.ptn_g_por_referencia / food.kcal_por_referencia;
    
    // Balanço de macros
    const proteinRatio = food.ptn_g_por_referencia / targets.protein_g;
    const carbRatio = food.cho_g_por_referencia / targets.carb_g;
    const fatRatio = food.lip_g_por_referencia / targets.fat_g;
    
    // Fibra (bonus)
    const fiberBonus = (food.fibra_g_por_referencia || 0) * 2;
    
    // Popularidade
    const popularityScore = (food.popularidade || 0) / 10;
    
    return (proteinDensity * 30) + (proteinRatio * 20) + (carbRatio * 20) + 
           (fatRatio * 20) + fiberBonus + popularityScore;
  }

  /**
   * Ajusta porção para valores realistas
   */
  private static adjustToRealisticPortion(quantity: number, unit: string): number {
    // Arredondar para valores práticos
    if (unit === 'g' || unit === 'ml') {
      if (quantity < 30) return Math.round(quantity / 5) * 5; // 5g
      if (quantity < 100) return Math.round(quantity / 10) * 10; // 10g
      if (quantity < 500) return Math.round(quantity / 25) * 25; // 25g
      return Math.round(quantity / 50) * 50; // 50g
    }
    return Math.max(1, Math.round(quantity));
  }

  /**
   * Ajuste fino de porções para aproximar das metas
   */
  private static fineTunePortions(
    foods: any[],
    targets: MacroTargets,
    currentTotals: { totalKcal: number; totalProtein: number; totalCarbs: number; totalFat: number }
  ): any[] {
    const kcalDiff = targets.kcal - currentTotals.totalKcal;
    
    // Se diferença < 10%, ajustar proporcionalmente
    if (Math.abs(kcalDiff / targets.kcal) < 0.1) {
      const adjustmentFactor = targets.kcal / currentTotals.totalKcal;
      
      return foods.map(food => ({
        ...food,
        quantity: Math.round(food.quantity * adjustmentFactor),
        calories: Math.round(food.calories * adjustmentFactor),
        protein: Math.round(food.protein * adjustmentFactor * 10) / 10,
        carbs: Math.round(food.carbs * adjustmentFactor * 10) / 10,
        fat: Math.round(food.fat * adjustmentFactor * 10) / 10,
      }));
    }
    
    return foods;
  }

  /**
   * Define estratégia inteligente de seleção por tipo de refeição
   */
  private static getMealStrategy(mealType: MealType): {
    categories: string[];
    portionLimits: Record<string, number>;
    categoryWeights: Record<string, number>;
  } {
    const strategies: Record<MealType, any> = {
      breakfast: {
        categories: ['Cereais e derivados', 'Leite e derivados', 'Frutas', 'Gorduras e óleos'],
        portionLimits: { 
          'Cereais e derivados': 2, 
          'Leite e derivados': 1.5, 
          'Frutas': 1,
          'Gorduras e óleos': 0.3
        },
        categoryWeights: {
          'Cereais e derivados': 0.4,
          'Leite e derivados': 0.3,
          'Frutas': 0.2,
          'Gorduras e óleos': 0.1
        }
      },
      morning_snack: {
        categories: ['Frutas', 'Oleaginosas', 'Leite e derivados'],
        portionLimits: { 'Frutas': 1, 'Oleaginosas': 0.5, 'Leite e derivados': 1 },
        categoryWeights: { 'Frutas': 0.5, 'Oleaginosas': 0.3, 'Leite e derivados': 0.2 }
      },
      lunch: {
        categories: ['Carnes e ovos', 'Cereais e derivados', 'Leguminosas', 'Hortaliças', 'Gorduras e óleos'],
        portionLimits: { 
          'Carnes e ovos': 1.5, 
          'Cereais e derivados': 2, 
          'Leguminosas': 1, 
          'Hortaliças': 2,
          'Gorduras e óleos': 0.5
        },
        categoryWeights: {
          'Carnes e ovos': 0.3,
          'Cereais e derivados': 0.25,
          'Leguminosas': 0.15,
          'Hortaliças': 0.2,
          'Gorduras e óleos': 0.1
        }
      },
      afternoon_snack: {
        categories: ['Frutas', 'Leite e derivados', 'Cereais e derivados'],
        portionLimits: { 'Frutas': 1, 'Leite e derivados': 1, 'Cereais e derivados': 0.5 },
        categoryWeights: { 'Frutas': 0.4, 'Leite e derivados': 0.4, 'Cereais e derivados': 0.2 }
      },
      dinner: {
        categories: ['Carnes e ovos', 'Cereais e derivados', 'Hortaliças', 'Leguminosas'],
        portionLimits: { 
          'Carnes e ovos': 1.2, 
          'Cereais e derivados': 1.5, 
          'Hortaliças': 2,
          'Leguminosas': 0.8
        },
        categoryWeights: {
          'Carnes e ovos': 0.35,
          'Cereais e derivados': 0.25,
          'Hortaliças': 0.25,
          'Leguminosas': 0.15
        }
      },
      evening_snack: {
        categories: ['Leite e derivados', 'Frutas'],
        portionLimits: { 'Leite e derivados': 1, 'Frutas': 0.5 },
        categoryWeights: { 'Leite e derivados': 0.6, 'Frutas': 0.4 }
      }
    };

    return strategies[mealType] || { 
      categories: [], 
      portionLimits: {},
      categoryWeights: {}
    };
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
