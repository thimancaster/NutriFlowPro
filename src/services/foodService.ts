
import { supabase } from '@/integrations/supabase/client';

export interface Food {
  id: string;
  name: string;
  food_group: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion_size: number;
  portion_unit: string;
  meal_time: string[];
  is_organic: boolean;
  allergens: string[];
  season: string[];
  preparation_time: number;
  cost_level: string;
  availability: string;
  sustainability_score: number;
}

export interface FoodSearchFilters {
  query?: string;
  food_group?: string;
  meal_time?: string;
  is_organic?: boolean;
  allergens?: string[];
  limit?: number;
}

export class FoodService {
  /**
   * Buscar alimentos com filtros
   */
  static async searchFoods(filters: FoodSearchFilters = {}): Promise<Food[]> {
    try {
      let query = supabase
        .from('foods')
        .select('*');

      // Filtro por nome
      if (filters.query) {
        query = query.ilike('name', `%${filters.query}%`);
      }

      // Filtro por grupo alimentar
      if (filters.food_group) {
        query = query.eq('food_group', filters.food_group);
      }

      // Filtro por horário de refeição
      if (filters.meal_time) {
        query = query.contains('meal_time', [filters.meal_time]);
      }

      // Filtro por orgânico
      if (filters.is_organic !== undefined) {
        query = query.eq('is_organic', filters.is_organic);
      }

      // Filtro por alérgenos (excluir alimentos com alérgenos específicos)
      if (filters.allergens && filters.allergens.length > 0) {
        for (const allergen of filters.allergens) {
          query = query.not('allergens', 'cs', `{${allergen}}`);
        }
      }

      // Limit
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      // Ordenar por nome
      query = query.order('name');

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      return [];
    }
  }

  /**
   * Buscar alimento por ID
   */
  static async getFoodById(id: string): Promise<Food | null> {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar alimento por ID:', error);
      return null;
    }
  }

  /**
   * Buscar alimentos por categoria
   */
  static async getFoodsByCategory(category: string): Promise<Food[]> {
    return this.searchFoods({ food_group: category });
  }

  /**
   * Buscar alimentos por horário de refeição
   */
  static async getFoodsForMealTime(mealTime: string): Promise<Food[]> {
    return this.searchFoods({ meal_time: mealTime });
  }

  /**
   * Buscar alimentos populares
   */
  static async getPopularFoods(limit: number = 20): Promise<Food[]> {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .in('food_group', ['proteinas', 'frutas', 'cereais_e_graos', 'vegetais'])
        .order('sustainability_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar alimentos populares:', error);
      return [];
    }
  }

  /**
   * Calcular valores nutricionais para uma quantidade específica
   */
  static calculateNutrition(food: Food, quantity: number): {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } {
    const factor = quantity / food.portion_size;
    
    return {
      calories: Math.round(food.calories * factor * 10) / 10,
      protein: Math.round(food.protein * factor * 10) / 10,
      carbs: Math.round(food.carbs * factor * 10) / 10,
      fats: Math.round(food.fats * factor * 10) / 10
    };
  }
}
