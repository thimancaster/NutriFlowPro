
import { supabase } from '@/integrations/supabase/client';
import { getMealSuggestions } from './brazilianFoodDatabase';

/**
 * Interface para mapeamento entre dados brasileiros e padrão do sistema
 */
interface FoodMappingConfig {
  brazilianName: string;
  standardName: string;
  categoryMapping: string;
  portionAdjustment?: number;
}

/**
 * Mapeamento entre nomes brasileiros e nomes padrão do sistema
 */
const FOOD_NAME_MAPPING: FoodMappingConfig[] = [
  { brazilianName: 'Maça', standardName: 'Maçã', categoryMapping: 'frutas' },
  { brazilianName: 'Pão Frânces', standardName: 'Pão Francês', categoryMapping: 'paes' },
  { brazilianName: 'Quejo Branco', standardName: 'Queijo Branco', categoryMapping: 'laticinios' },
  { brazilianName: 'Sobrecoxa de frago assada', standardName: 'Sobrecoxa de frango assada', categoryMapping: 'proteinas' },
  { brazilianName: 'Coxã mole frito', standardName: 'Coxão mole frito', categoryMapping: 'proteinas' },
];

/**
 * Sincroniza dados do banco brasileiro com o banco padronizado
 */
export const syncBrazilianFoodData = async (): Promise<{
  success: boolean;
  synced: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let syncedCount = 0;

  try {
    console.log('Iniciando sincronização dos alimentos brasileiros...');

    // Buscar alimentos existentes no banco
    const { data: existingFoods, error: fetchError } = await supabase
      .from('foods')
      .select('name, id');

    if (fetchError) {
      throw new Error(`Erro ao buscar alimentos existentes: ${fetchError.message}`);
    }

    const existingFoodNames = new Set(
      existingFoods?.map(food => food.name.toLowerCase()) || []
    );

    // Processar alimentos simulados (implementação futura)
    const mockFoods = [];
    for (const brazilianFood of mockFoods) {
      try {
        // Pular categorias (que têm NaN nos valores nutricionais)
        if (isNaN(brazilianFood.calories)) {
          continue;
        }

        // Verificar se precisa de mapeamento de nome
        const mapping = FOOD_NAME_MAPPING.find(
          m => m.brazilianName.toLowerCase() === brazilianFood.name.toLowerCase()
        );

        const standardName = mapping?.standardName || brazilianFood.name;

        // Verificar se o alimento já existe no banco padronizado
        if (existingFoodNames.has(standardName.toLowerCase())) {
          console.log(`Alimento já existe: ${standardName}`);
          continue;
        }

        // Mapear categoria brasileira para categoria padrão
        const foodGroup = mapBrazilianCategory(brazilianFood.category);
        
        // Converter porção (alguns alimentos brasileiros têm porções diferentes)
        const portionData = convertBrazilianPortion(brazilianFood);

        // Determinar horários de refeição baseados na categoria
        const mealTimes = determineMealTimes(brazilianFood.category, brazilianFood.mealTime);

        // Inserir alimento no banco padronizado
        const { error: insertError } = await supabase
          .from('foods')
          .insert({
            name: standardName,
            food_group: foodGroup,
            category: foodGroup,
            calories: brazilianFood.calories,
            protein: brazilianFood.protein,
            carbs: brazilianFood.carbs,
            fats: brazilianFood.fats,
            portion_size: portionData.size,
            portion_unit: portionData.unit,
            meal_time: mealTimes,
            is_organic: false,
            allergens: determineAllergens(brazilianFood.name, brazilianFood.category),
            season: ['Ano todo'],
            preparation_time: estimatePreparationTime(brazilianFood.category),
            cost_level: 'medio',
            availability: 'comum',
            sustainability_score: 5
          });

        if (insertError) {
          errors.push(`Erro ao inserir ${standardName}: ${insertError.message}`);
        } else {
          syncedCount++;
          console.log(`✓ Sincronizado: ${standardName}`);
        }

      } catch (error: any) {
        errors.push(`Erro ao processar ${brazilianFood.name}: ${error.message}`);
      }
    }

    console.log(`Sincronização concluída: ${syncedCount} alimentos sincronizados`);

    return {
      success: errors.length === 0,
      synced: syncedCount,
      errors
    };

  } catch (error: any) {
    console.error('Erro geral na sincronização:', error);
    return {
      success: false,
      synced: syncedCount,
      errors: [error.message]
    };
  }
};

/**
 * Mapeia categoria brasileira para categoria padrão
 */
const mapBrazilianCategory = (brazilianCategory: string): string => {
  const categoryMap: Record<string, string> = {
    'proteina': 'proteinas',
    'carboidrato': 'cereais_e_graos',
    'fruta': 'frutas',
    'vegetal': 'vegetais',
    'gordura': 'gorduras',
    'bebida': 'bebidas'
  };

  return categoryMap[brazilianCategory] || 'outros';
};

/**
 * Converte porção brasileira para formato padrão
 */
const convertBrazilianPortion = (food: any): { size: number; unit: string } => {
  // A maioria dos alimentos brasileiros já está em 100g ou 100ml
  // Ajustar conforme necessário baseado na porção original
  
  if (food.portion && food.portion.includes('ml')) {
    return { size: 100, unit: 'ml' };
  }
  
  return { size: 100, unit: 'g' };
};

/**
 * Determina horários de refeição baseados na categoria e dados brasileiros
 */
const determineMealTimes = (category: string, brazilianMealTimes: string[]): string[] => {
  const mealTimeMap: Record<string, string> = {
    'breakfast': 'cafe_da_manha',
    'morning_snack': 'lanche',
    'lunch': 'almoco',
    'afternoon_snack': 'lanche',
    'dinner': 'jantar',
    'evening_snack': 'lanche'
  };

  const mappedTimes = brazilianMealTimes
    .map(time => mealTimeMap[time])
    .filter(Boolean);

  // Se não há mapeamento específico, usar padrões por categoria
  if (mappedTimes.length === 0) {
    switch (category) {
      case 'fruta':
        return ['lanche', 'cafe_da_manha', 'any'];
      case 'proteina':
        return ['almoco', 'jantar', 'any'];
      case 'carboidrato':
        return ['cafe_da_manha', 'almoco', 'jantar', 'any'];
      default:
        return ['any'];
    }
  }

  return [...new Set([...mappedTimes, 'any'])]; // Remove duplicatas e adiciona 'any'
};

/**
 * Determina alérgenos baseados no nome e categoria do alimento
 */
const determineAllergens = (name: string, category: string): string[] => {
  const allergens: string[] = [];
  
  const nameLC = name.toLowerCase();
  
  if (nameLC.includes('leite') || nameLC.includes('queijo') || 
      nameLC.includes('iogurte') || nameLC.includes('requeijão')) {
    allergens.push('Lactose');
  }
  
  if (nameLC.includes('pão') || nameLC.includes('macarrão') || 
      nameLC.includes('bolacha') || nameLC.includes('farinha')) {
    allergens.push('Glúten');
  }
  
  if (nameLC.includes('ovo')) {
    allergens.push('Ovos');
  }
  
  if (nameLC.includes('amendoim')) {
    allergens.push('Amendoim');
  }
  
  if (nameLC.includes('soja')) {
    allergens.push('Soja');
  }
  
  if (nameLC.includes('peixe') || nameLC.includes('salmão') || 
      nameLC.includes('atum') || nameLC.includes('sardinha')) {
    allergens.push('Peixes');
  }

  return allergens;
};

/**
 * Estima tempo de preparo baseado na categoria
 */
const estimatePreparationTime = (category: string): number => {
  switch (category) {
    case 'fruta':
    case 'bebida':
      return 0;
    case 'proteina':
      return 15;
    case 'carboidrato':
      return 20;
    case 'vegetal':
      return 10;
    default:
      return 5;
  }
};

/**
 * Busca alimentos por categoria padronizada
 */
export const getFoodsByStandardCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('food_group', category)
    .order('name');

  if (error) {
    console.error('Erro ao buscar alimentos por categoria:', error);
    return [];
  }

  return data || [];
};

/**
 * Busca alimentos por múltiplas categorias
 */
export const getFoodsByCategories = async (categories: string[]) => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .in('food_group', categories)
    .order('food_group', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar alimentos por categorias:', error);
    return [];
  }

  return data || [];
};

/**
 * Busca alimentos apropriados para um horário de refeição
 */
export const getFoodsForMealTime = async (mealTime: string) => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .contains('meal_time', [mealTime])
    .order('food_group', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar alimentos por horário:', error);
    return [];
  }

  return data || [];
};
