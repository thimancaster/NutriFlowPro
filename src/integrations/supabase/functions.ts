import { supabase } from "./client";
import { AlimentoV2 } from "@/types/alimento";

/**
 * Get Activity Factors from Supabase (spreadsheet fidelity)
 * Fetches FA values from parametros_get_planilha table
 */
export async function getParametrosGETPlanilha(
  perfil: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta',
  sexo: 'M' | 'F'
): Promise<{ fa_valor: number; formula_tmb: string; formula_get: string } | null> {
  try {
    console.log('[SUPABASE] Fetching parametros_get_planilha:', { perfil, sexo });
    
    const { data, error } = await supabase
      .from('parametros_get_planilha')
      .select('fa_valor, formula_tmb_detalhe, formula_get_detalhe')
      .eq('perfil', perfil)
      .eq('sexo', sexo)
      .maybeSingle();

    if (error) {
      console.error('[SUPABASE] Error fetching parametros_get_planilha:', error);
      return null;
    }

    if (!data) {
      console.warn('[SUPABASE] No parameters found for:', { perfil, sexo });
      return null;
    }

    console.log('[SUPABASE] ✅ Retrieved parametros:', data);
    
    return {
      fa_valor: data.fa_valor,
      formula_tmb: data.formula_tmb_detalhe,
      formula_get: data.formula_get_detalhe
    };
  } catch (error) {
    console.error('[SUPABASE] Exception in getParametrosGETPlanilha:', error);
    return null;
  }
}

// Function to get all food categories from the standardized table
export const getFoodCategories = async () => {
  const { data, error } = await supabase
    .from("food_categories")
    .select("id, name, display_name, color, icon, description")
    .order("sort_order");

  if (error) {
    console.error("Error fetching food categories:", error);
    return [];
  }

  return (
    data?.map((category) => ({
      id: category.id,
      name: category.display_name,
      color: category.color,
      icon: category.icon,
      description: category.description,
    })) || []
  );
};

// Enhanced function to get foods with pagination using alimentos_v2
export const getFoodsWithNutrition = async (filters?: {
  category?: string;
  searchTerm?: string;
  mealTime?: string[];
  page?: number;
  pageSize?: number;
}) => {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 50;
  const offset = (page - 1) * pageSize;

  let query = supabase.from("alimentos_v2").select(
    `
      id,
      nome,
      categoria,
      subcategoria,
      kcal_por_referencia,
      ptn_g_por_referencia,
      cho_g_por_referencia,
      lip_g_por_referencia,
      fibra_g_por_referencia,
      sodio_mg_por_referencia,
      peso_referencia_g,
      medida_padrao_referencia,
      tipo_refeicao_sugerida,
      keywords,
      popularidade
    `,
    { count: "exact" }
  ).eq("ativo", true);

  // Category filtering
  if (filters?.category) {
    query = query.eq("categoria", filters.category);
  }

  if (filters?.searchTerm) {
    query = query.ilike("nome", `%${filters.searchTerm}%`);
  }

  if (filters?.mealTime && filters.mealTime.length > 0) {
    query = query.overlaps("tipo_refeicao_sugerida", filters.mealTime);
  }

  // Apply pagination
  const { data, error, count } = await query
    .order("popularidade", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching foods:", error);
    return { data: [], count: 0, hasMore: false, currentPage: 1, totalPages: 0 };
  }

  // Map to standardized format
  const mappedData = (data || []).map((food) => ({
    id: food.id,
    name: food.nome,
    food_group: food.categoria,
    calories: food.kcal_por_referencia,
    protein: food.ptn_g_por_referencia,
    carbs: food.cho_g_por_referencia,
    fats: food.lip_g_por_referencia,
    fiber: food.fibra_g_por_referencia,
    sodium: food.sodio_mg_por_referencia,
    portion_size: food.peso_referencia_g,
    portion_unit: food.medida_padrao_referencia,
    meal_time: food.tipo_refeicao_sugerida,
  }));

  return {
    data: mappedData,
    count: count || 0,
    hasMore: (count || 0) > offset + pageSize,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
};

// Function to get food details using alimentos_v2
export const getFoodDetails = async (foodId: string): Promise<AlimentoV2 | null> => {
  const { data, error } = await supabase
    .from("alimentos_v2")
    .select("*")
    .eq("id", foodId)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching food details:", error);
    return null;
  }

  return data;
};

// Simple nutritional density calculation
export const calculateNutritionalDensity = async (foodId: string) => {
  try {
    const food = await getFoodDetails(foodId);
    if (!food) return 0;

    // Simple calculation based on protein content, fiber, and calories
    const proteinScore = (food.ptn_g_por_referencia / food.kcal_por_referencia) * 100 || 0;
    const fiberScore = (food.fibra_g_por_referencia || 0) * 2;
    const density = Math.min(100, (proteinScore + fiberScore) * 2);

    return density;
  } catch (error) {
    console.error("Error calculating nutritional density:", error);
    return 0;
  }
};

// Enhanced function to generate meal plans using existing database function
interface MealPlanOptions {
  userId: string;
  patientId: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  preferences?: string[];
  restrictions?: string[];
  date?: string;
}

export const generateIntelligentMealPlan = async (options: MealPlanOptions) => {
  const {
    userId,
    patientId,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFats,
    date = new Date().toISOString().split("T")[0],
  } = options;

  const { data, error } = await supabase.rpc("generate_meal_plan", {
    p_user_id: userId,
    p_patient_id: patientId,
    p_target_calories: targetCalories,
    p_target_protein: targetProtein,
    p_target_carbs: targetCarbs,
    p_target_fats: targetFats,
    p_date: date,
  });

  if (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }

  return data;
};

// Function to get food substitutions with nutritional similarity
export const getFoodSubstitutions = async (foodId: string) => {
  const { data, error } = await supabase
    .from("food_substitutions")
    .select(
      `
      id,
      reason,
      recommendations,
      nutritional_similarity,
      substitute_id
    `
    )
    .eq("food_id", foodId);

  if (error) {
    console.error("Error fetching food substitutions:", error);
    return [];
  }

  return data || [];
};

// Function to search foods by nutritional criteria using alimentos_v2
interface NutritionalCriteria {
  minProtein?: number;
  maxCalories?: number;
  minFiber?: number;
  maxSodium?: number;
}

export const searchFoodsByNutrition = async (criteria: NutritionalCriteria): Promise<AlimentoV2[]> => {
  let query = supabase.from("alimentos_v2").select("*").eq("ativo", true);

  if (criteria.minProtein !== undefined) {
    query = query.gte("ptn_g_por_referencia", criteria.minProtein);
  }

  if (criteria.maxCalories !== undefined) {
    query = query.lte("kcal_por_referencia", criteria.maxCalories);
  }

  if (criteria.minFiber !== undefined) {
    query = query.gte("fibra_g_por_referencia", criteria.minFiber);
  }

  if (criteria.maxSodium !== undefined) {
    query = query.lte("sodio_mg_por_referencia", criteria.maxSodium);
  }

  const { data, error } = await query.order("ptn_g_por_referencia", { ascending: false });

  if (error) {
    console.error("Error searching foods by nutrition:", error);
    return [];
  }

  return data || [];
};

// Legacy functions for backward compatibility
export const getNutritionalValues = async (foodId: string) => {
  const food = await getFoodDetails(foodId);

  if (!food) return null;

  return {
    id: foodId,
    measure_id: foodId,
    calories: food.kcal_por_referencia,
    protein: food.ptn_g_por_referencia,
    carbs: food.cho_g_por_referencia,
    fat: food.lip_g_por_referencia,
  };
};
