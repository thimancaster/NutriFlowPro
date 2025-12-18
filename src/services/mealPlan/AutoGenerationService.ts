/**
 * AUTO GENERATION SERVICE - MOTOR ÚNICO DE GERAÇÃO DE PLANOS ALIMENTARES
 * 
 * REGRA DE OURO: Toda lógica de decisão sobre "qual alimento escolher" ou 
 * "quanto colocar" deve residir EXCLUSIVAMENTE nesta classe.
 * 
 * ARQUITETURA:
 * 1. Busca Híbrida (tipo_refeicao_sugerida → categoria TACO/IBGE)
 * 2. Filtros de Restrição (vegetariano, vegano, intolerante_lactose)
 * 3. Scoring Nutricional (hipertrofia vs emagrecimento)
 * 4. Preenchimento Guloso com Variedade
 */

import { supabase } from "@/integrations/supabase/client";
import { Refeicao, ItemRefeicao, AlimentoV2 } from "@/hooks/useMealPlanCalculations";

// --- 1. CATEGORIAS TACO/IBGE (Source of Truth) ---

const TACO_CATEGORIES = {
  CAFE_LANCHE: [
    "Cereais e derivados",
    "Leite e derivados",
    "Frutas e derivados",
    "Panificados",
    "Pães e Padaria",
    "Cereais e Grãos",
    "Cereais",
    "Laticínios",
    "Frutas",
    "Doces e Sobremesas",
    "Ovos"
  ],
  ALMOCO_JANTAR: [
    "Carnes e derivados",
    "Aves e derivados",
    "Pescados e frutos do mar",
    "Leguminosas e derivados",
    "Verduras, hortaliças e derivados",
    "Tubérculos e raízes",
    "Carnes Bovinas",
    "Carnes Suínas",
    "Aves",
    "Peixes e Frutos do Mar",
    "Leguminosas",
    "Verduras e Legumes",
    "Tubérculos",
    "Cereais e Grãos",
    "Massas"
  ]
};

// Mapeamento: Nome da Refeição → Tags esperadas no banco
const MEAL_TYPE_MAP: Record<string, string[]> = {
  "Café da Manhã": ["cafe_da_manha", "breakfast", "any"],
  "Lanche da Manhã": ["lanche_manha", "lanche", "snack", "any"],
  "Almoço": ["almoco", "lunch", "any"],
  "Lanche da Tarde": ["lanche_tarde", "lanche", "snack", "any"],
  "Jantar": ["jantar", "dinner", "any"],
  "Ceia": ["ceia", "lanche", "snack", "any"]
};

// Mapeamento: Nome da Refeição → Categorias TACO/IBGE para fallback
const CATEGORY_FALLBACK: Record<string, string[]> = {
  "Café da Manhã": TACO_CATEGORIES.CAFE_LANCHE,
  "Lanche da Manhã": ["Frutas", "Frutas e derivados", "Laticínios", "Leite e derivados", "Castanhas e Sementes"],
  "Almoço": TACO_CATEGORIES.ALMOCO_JANTAR,
  "Lanche da Tarde": ["Frutas", "Frutas e derivados", "Laticínios", "Leite e derivados", "Cereais e Grãos"],
  "Jantar": TACO_CATEGORIES.ALMOCO_JANTAR,
  "Ceia": ["Laticínios", "Leite e derivados", "Frutas", "Frutas e derivados"]
};

// --- 2. FILTROS DE RESTRIÇÃO (Segurança Clínica) ---

const RESTRICTION_EXCLUSIONS: Record<string, string[]> = {
  vegetariano: [
    "Carnes", "Carnes e derivados", "Carnes Bovinas", "Carnes Suínas",
    "Aves", "Aves e derivados", "Pescados", "Pescados e frutos do mar",
    "Peixes e Frutos do Mar", "Embutidos"
  ],
  vegano: [
    "Carnes", "Carnes e derivados", "Carnes Bovinas", "Carnes Suínas",
    "Aves", "Aves e derivados", "Pescados", "Pescados e frutos do mar",
    "Peixes e Frutos do Mar", "Embutidos",
    "Leite", "Leite e derivados", "Laticínios",
    "Ovos", "Mel"
  ],
  intolerante_lactose: [
    "Leite e derivados", "Laticínios"
  ],
  low_carb: [
    "Cereais", "Cereais e derivados", "Cereais e Grãos",
    "Tubérculos", "Tubérculos e raízes",
    "Massas", "Doces e Sobremesas"
  ],
  sem_gluten: [
    "Pães e Padaria", "Massas", "Panificados"
  ]
};

// --- 3. CONSTANTES DO ALGORITMO ---

const MIN_CANDIDATES_THRESHOLD = 10;
const MAX_ITEMS_PER_MEAL = 5;
const MIN_KCAL_PERCENT = 0.85;
const MAX_KCAL_PERCENT = 1.15;
const MAX_PORTION = 3.0;
const MIN_PORTION = 0.5;
const TOP_CANDIDATES_SHUFFLE = 20;

// --- 4. TIPOS ---

export interface PatientProfile {
  objective: string;
  restrictions: string[];
  gender: string;
}

// --- 5. SERVIÇO PRINCIPAL ---

export class AutoGenerationService {
  
  /**
   * ÚNICO PONTO DE ENTRADA para gerar dietas no sistema.
   */
  static async generatePlan(
    currentRefeicoes: Refeicao[], 
    patientProfile: PatientProfile
  ): Promise<Refeicao[]> {
    console.log("🦾 [MOTOR] Iniciando geração com perfil:", patientProfile);
    
    // 1. Clona para não mutar estado
    const newRefeicoes: Refeicao[] = JSON.parse(JSON.stringify(currentRefeicoes));
    const usedFoodIds = new Set<string>();
    let mealsGenerated = 0;

    // 2. Processa cada refeição
    for (const refeicao of newRefeicoes) {
      // Se nutricionista já adicionou itens, respeita
      if (refeicao.itens.length > 0) {
        console.log(`⏭️ [MOTOR] ${refeicao.nome}: já tem ${refeicao.itens.length} itens`);
        refeicao.itens.forEach(item => usedFoodIds.add(item.alimento_id));
        continue;
      }

      const targetKcal = refeicao.alvo_kcal;
      if (!targetKcal || targetKcal <= 50) {
        console.log(`⏭️ [MOTOR] ${refeicao.nome}: alvo kcal inválido (${targetKcal})`);
        continue;
      }

      try {
        // A. BUSCA HÍBRIDA
        let candidates = await this.fetchCandidatesHybrid(refeicao.nome);
        console.log(`📦 [MOTOR] ${refeicao.nome}: ${candidates.length} candidatos brutos`);

        // B. FILTRO DE RESTRIÇÕES
        candidates = this.applyRestrictionFilters(candidates, patientProfile.restrictions);
        console.log(`🔒 [MOTOR] ${refeicao.nome}: ${candidates.length} após filtros`);

        if (candidates.length === 0) {
          console.warn(`⚠️ [MOTOR] ${refeicao.nome}: sem candidatos após filtros`);
          continue;
        }

        // C. SCORING NUTRICIONAL
        candidates = this.applyNutritionalScoring(candidates, patientProfile.objective);

        // D. PREENCHIMENTO GULOSO
        refeicao.itens = this.fillMealIntelligently(candidates, targetKcal, usedFoodIds);
        
        if (refeicao.itens.length > 0) {
          mealsGenerated++;
          const totalKcal = refeicao.itens.reduce((sum, i) => sum + i.kcal_calculado, 0);
          console.log(`✅ [MOTOR] ${refeicao.nome}: ${refeicao.itens.length} itens, ${Math.round(totalKcal)} kcal (alvo: ${targetKcal})`);
        }
        
      } catch (error) {
        console.error(`❌ [MOTOR] Erro em ${refeicao.nome}:`, error);
      }
    }

    console.log(`🏁 [MOTOR] Geração concluída: ${mealsGenerated} refeições preenchidas`);
    return newRefeicoes;
  }

  // --- MÉTODOS DE BUSCA ---

  /**
   * Busca híbrida: primeiro por tipo_refeicao_sugerida, depois por categoria
   */
  private static async fetchCandidatesHybrid(mealName: string): Promise<AlimentoV2[]> {
    const mealTypes = MEAL_TYPE_MAP[mealName] || ["any"];
    
    // ESTRATÉGIA 1: Busca precisa por tipo de refeição sugerida
    let { data: foods, error } = await supabase
      .from('alimentos_v2')
      .select('*')
      .eq('ativo', true)
      .overlaps('tipo_refeicao_sugerida', mealTypes)
      .order('popularidade', { ascending: false, nullsFirst: false })
      .limit(80);

    if (error) {
      console.error(`❌ [MOTOR] Erro na busca por tipo:`, error);
      foods = [];
    }

    // ESTRATÉGIA 2: Fallback por categorias TACO/IBGE
    if (!foods || foods.length < MIN_CANDIDATES_THRESHOLD) {
      console.log(`⚠️ [MOTOR] Fallback para categorias TACO em: ${mealName}`);
      const fallbackCats = CATEGORY_FALLBACK[mealName] || TACO_CATEGORIES.CAFE_LANCHE;
      
      const { data: fallbackFoods, error: fallbackError } = await supabase
        .from('alimentos_v2')
        .select('*')
        .eq('ativo', true)
        .in('categoria', fallbackCats)
        .order('popularidade', { ascending: false, nullsFirst: false })
        .limit(80);

      if (fallbackError) {
        console.error(`❌ [MOTOR] Erro no fallback:`, fallbackError);
      }
        
      // Merge evitando duplicatas
      const existingIds = new Set(foods?.map(f => f.id) || []);
      const newFoods = (fallbackFoods || []).filter(f => !existingIds.has(f.id));
      foods = [...(foods || []), ...newFoods];
    }

    return (foods as AlimentoV2[]) || [];
  }

  // --- MÉTODOS DE FILTRAGEM ---

  /**
   * Aplica filtros de restrição alimentar
   */
  private static applyRestrictionFilters(
    foods: AlimentoV2[], 
    restrictions: string[]
  ): AlimentoV2[] {
    if (!restrictions || restrictions.length === 0) return foods;

    // Coleta todas as categorias proibidas
    const forbiddenCategories = new Set<string>();
    
    for (const restriction of restrictions) {
      const normalizedRestriction = restriction.toLowerCase().replace(/\s+/g, '_');
      const exclusions = RESTRICTION_EXCLUSIONS[normalizedRestriction];
      
      if (exclusions) {
        exclusions.forEach(cat => forbiddenCategories.add(cat.toLowerCase()));
      }
    }

    if (forbiddenCategories.size === 0) return foods;

    return foods.filter(food => {
      const foodCategory = (food.categoria || '').toLowerCase();
      
      // Verifica se a categoria do alimento contém alguma categoria proibida
      for (const forbidden of forbiddenCategories) {
        if (foodCategory.includes(forbidden) || forbidden.includes(foodCategory)) {
          return false;
        }
      }
      return true;
    });
  }

  // --- MÉTODOS DE SCORING ---

  /**
   * Aplica scoring nutricional baseado no objetivo
   */
  private static applyNutritionalScoring(
    foods: AlimentoV2[], 
    objective: string
  ): AlimentoV2[] {
    const obj = (objective || '').toLowerCase();
    
    const isHypertrophy = 
      obj.includes('hipertrofia') || 
      obj.includes('ganho') || 
      obj.includes('massa') ||
      obj.includes('ganho_massa');
      
    const isWeightLoss = 
      obj.includes('emagrecimento') || 
      obj.includes('perda') || 
      obj.includes('definicao') ||
      obj.includes('definição');

    // Se não tem objetivo claro, shuffle para variedade
    if (!isHypertrophy && !isWeightLoss) {
      return this.shuffleArray(foods);
    }

    // Ordena por score
    const scoredFoods = foods.map(food => ({
      food,
      score: this.calculateNutritionalScore(food, isHypertrophy, isWeightLoss)
    }));

    scoredFoods.sort((a, b) => b.score - a.score);

    return scoredFoods.map(item => item.food);
  }

  /**
   * Calcula score nutricional individual
   * 
   * HIPERTROFIA: (Proteína × 3) + (Carboidrato × 1.5)
   * EMAGRECIMENTO: (Proteína × 4) - (Gordura × 2) - (Densidade Calórica)
   */
  private static calculateNutritionalScore(
    food: AlimentoV2, 
    isHypertrophy: boolean, 
    isWeightLoss: boolean
  ): number {
    const ptn = food.ptn_g_por_referencia || 0;
    const cho = food.cho_g_por_referencia || 0;
    const lip = food.lip_g_por_referencia || 0;
    const kcal = food.kcal_por_referencia || 1;
    const pesoRef = food.peso_referencia_g || 100;
    
    // Densidade calórica (kcal por grama)
    const densidadeCalorica = kcal / pesoRef;

    if (isHypertrophy) {
      // Valoriza proteína e carboidrato para síntese muscular
      return (ptn * 3) + (cho * 1.5);
    } 
    
    if (isWeightLoss) {
      // Valoriza proteína (saciedade), pune gordura e alta densidade calórica
      return (ptn * 4) - (lip * 2) - (densidadeCalorica * 10);
    }
    
    // Manutenção: score neutro baseado em popularidade
    return food.popularidade || 0;
  }

  // --- MÉTODOS DE PREENCHIMENTO ---

  /**
   * Preenche uma refeição de forma inteligente
   */
  private static fillMealIntelligently(
    foods: AlimentoV2[], 
    targetKcal: number, 
    usedIds: Set<string>
  ): ItemRefeicao[] {
    let currentKcal = 0;
    const selectedItems: ItemRefeicao[] = [];
    
    // Pega os top candidatos e embaralha para variedade
    const topCandidates = this.shuffleArray(
      foods.slice(0, TOP_CANDIDATES_SHUFFLE)
    );

    for (const food of topCandidates) {
      // Travas de segurança
      if (usedIds.has(food.id)) continue;
      if (currentKcal >= targetKcal * MIN_KCAL_PERCENT) break;
      if (selectedItems.length >= MAX_ITEMS_PER_MEAL) break;

      const foodKcal = food.kcal_por_referencia || 0;
      if (foodKcal === 0) continue;

      const remaining = targetKcal - currentKcal;
      
      // Cálculo inteligente de porção (arredondado para 0.5)
      let qtd = Math.round((remaining / foodKcal) * 2) / 2;
      
      // Limites fisiológicos
      qtd = Math.max(MIN_PORTION, Math.min(MAX_PORTION, qtd));

      const itemKcal = foodKcal * qtd;

      // Aceita se não estourar a meta (115%)
      if ((currentKcal + itemKcal) <= targetKcal * MAX_KCAL_PERCENT) {
        selectedItems.push(this.createMealItem(food, qtd));
        currentKcal += itemKcal;
        usedIds.add(food.id);
      }
    }
    
    return selectedItems;
  }

  /**
   * Cria um item de refeição a partir de um alimento
   */
  private static createMealItem(food: AlimentoV2, quantidade: number): ItemRefeicao {
    return {
      id: crypto.randomUUID(),
      alimento_id: food.id,
      alimento_nome: food.nome,
      medida_utilizada: food.medida_padrao_referencia,
      quantidade,
      peso_total_g: (food.peso_referencia_g || 0) * quantidade,
      kcal_calculado: (food.kcal_por_referencia || 0) * quantidade,
      ptn_g_calculado: (food.ptn_g_por_referencia || 0) * quantidade,
      cho_g_calculado: (food.cho_g_por_referencia || 0) * quantidade,
      lip_g_calculado: (food.lip_g_por_referencia || 0) * quantidade,
    };
  }

  // --- UTILITÁRIOS ---

  /**
   * Embaralha array (Fisher-Yates)
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
