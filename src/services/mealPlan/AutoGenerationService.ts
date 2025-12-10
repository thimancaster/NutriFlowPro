/**
 * AUTO GENERATION SERVICE - MOTOR ÚNICO DE GERAÇÃO DE PLANOS ALIMENTARES
 * 
 * REGRA DE OURO: Toda lógica de decisão sobre "qual alimento escolher" ou 
 * "quanto colocar" deve residir EXCLUSIVAMENTE nesta classe.
 */

import { supabase } from "@/integrations/supabase/client";
import { Refeicao, ItemRefeicao, AlimentoV2 } from "@/hooks/useMealPlanCalculations";

// --- 1. CONFIGURAÇÕES DO MOTOR (SOT - Source of Truth) ---

// Mapeamento: Nome da Refeição (UI) -> Tags no Banco (tipo_refeicao_sugerida)
const MEAL_TYPE_MAP: Record<string, string[]> = {
  "Café da Manhã": ["cafe_da_manha", "any"],
  "Lanche da Manhã": ["lanche_manha", "lanche", "any"],
  "Almoço": ["almoco", "any"],
  "Lanche da Tarde": ["lanche_tarde", "lanche", "any"],
  "Jantar": ["jantar", "any"],
  "Ceia": ["ceia", "lanche", "any"]
};

// Fallback com CATEGORIAS REAIS do banco alimentos_v2
const CATEGORY_FALLBACK: Record<string, string[]> = {
  "Café da Manhã": ["Cereais", "Cereais e Derivados", "Laticínios", "Frutas"],
  "Lanche da Manhã": ["Frutas", "Laticínios"],
  "Almoço": ["Carnes", "Proteínas", "Cereais", "Leguminosas", "Tubérculos"],
  "Lanche da Tarde": ["Frutas", "Laticínios", "Cereais"],
  "Jantar": ["Carnes", "Proteínas", "Cereais", "Leguminosas"],
  "Ceia": ["Laticínios", "Frutas"]
};

// Filtros de Exclusão (Segurança Clínica)
const RESTRICTION_MAP: Record<string, string[]> = {
  "vegetariano": ["Carnes", "Proteínas"],
  "vegano": ["Carnes", "Proteínas", "Laticínios"],
  "intolerante_lactose": ["Laticínios"],
  "low_carb": ["Cereais", "Cereais e Derivados", "Tubérculos"]
};

// Limites do Algoritmo
const MAX_ITEMS_PER_MEAL = 4;
const MIN_KCAL_PERCENT = 0.85;
const MAX_KCAL_PERCENT = 1.15;
const MAX_PORTION = 3.0;
const MIN_PORTION = 0.5;

export interface PatientProfile {
  objective: string;
  restrictions: string[];
  gender: string;
}

export class AutoGenerationService {
  
  /**
   * ÚNICO PONTO DE ENTRADA para gerar dietas no sistema.
   */
  static async generatePlan(
    currentRefeicoes: Refeicao[], 
    patientProfile: PatientProfile
  ): Promise<Refeicao[]> {
    console.log("🦾 [MOTOR ÚNICO] Iniciando geração para:", patientProfile);
    
    // 1. Clona para não mutar estado
    const newRefeicoes: Refeicao[] = JSON.parse(JSON.stringify(currentRefeicoes));
    const usedFoodIds = new Set<string>(); // Evita repetição de alimentos no mesmo dia
    let mealsGenerated = 0;

    // 2. Processa cada refeição
    for (const refeicao of newRefeicoes) {
      // Regra: Se o nutri já colocou algo, respeitamos e não tocamos.
      if (refeicao.itens.length > 0) {
        console.log(`⏭️ [MOTOR] Pulando ${refeicao.nome} - já tem ${refeicao.itens.length} itens`);
        continue;
      }

      const targetKcal = refeicao.alvo_kcal;
      if (!targetKcal || targetKcal <= 50) {
        console.log(`⏭️ [MOTOR] Pulando ${refeicao.nome} - alvo kcal inválido: ${targetKcal}`);
        continue;
      }

      try {
        // A. BUSCA HÍBRIDA (Tipo -> Categoria)
        let candidates = await this.fetchCandidates(refeicao.nome);
        console.log(`📦 [MOTOR] ${refeicao.nome}: ${candidates.length} candidatos encontrados`);

        // B. FILTRAGEM DE SEGURANÇA (Restrições)
        candidates = this.filterRestrictions(candidates, patientProfile.restrictions);
        console.log(`🔒 [MOTOR] ${refeicao.nome}: ${candidates.length} após filtro de restrições`);

        if (candidates.length === 0) {
          console.warn(`⚠️ [MOTOR] Sem candidatos para ${refeicao.nome} após filtros.`);
          continue;
        }

        // C. SCORING INTELIGENTE (Objetivo)
        candidates = this.rankFoodsByGoal(candidates, patientProfile.objective);

        // D. ALGORITMO GULOSO (Preenchimento)
        refeicao.itens = this.fillMealSlots(candidates, targetKcal, usedFoodIds);
        
        if (refeicao.itens.length > 0) {
          mealsGenerated++;
          console.log(`✅ [MOTOR] ${refeicao.nome}: ${refeicao.itens.length} itens adicionados`);
        }
        
      } catch (error) {
        console.error(`❌ [MOTOR] Erro crítico em ${refeicao.nome}:`, error);
      }
    }

    console.log(`🏁 [MOTOR] Geração concluída: ${mealsGenerated} refeições preenchidas`);
    return newRefeicoes;
  }

  // --- MÉTODOS INTERNOS (Privados) ---

  private static async fetchCandidates(mealName: string): Promise<AlimentoV2[]> {
    const mealTypes = MEAL_TYPE_MAP[mealName] || ["any"];
    
    // Estratégia 1: Busca Precisa (pelo tipo de refeição sugerida no cadastro)
    let { data: foods, error } = await supabase
      .from('alimentos_v2')
      .select('*')
      .eq('ativo', true)
      .overlaps('tipo_refeicao_sugerida', mealTypes)
      .limit(60);

    if (error) {
      console.error(`❌ [MOTOR] Erro na busca por tipo:`, error);
    }

    // Estratégia 2: Fallback (se a busca precisa falhar ou trouxer poucos itens)
    if (!foods || foods.length < 10) {
      console.log(`⚠️ [MOTOR] Fallback para categorias em: ${mealName}`);
      const fallbackCats = CATEGORY_FALLBACK[mealName] || ["Frutas"];
      
      const { data: fallbackFoods, error: fallbackError } = await supabase
        .from('alimentos_v2')
        .select('*')
        .eq('ativo', true)
        .in('categoria', fallbackCats)
        .limit(60);

      if (fallbackError) {
        console.error(`❌ [MOTOR] Erro no fallback:`, fallbackError);
      }
        
      // Merge evitando duplicatas
      const existingIds = new Set(foods?.map(f => f.id));
      const newFoods = (fallbackFoods || []).filter(f => !existingIds.has(f.id));
      foods = [...(foods || []), ...newFoods];
    }

    return (foods as AlimentoV2[]) || [];
  }

  private static filterRestrictions(foods: AlimentoV2[], restrictions: string[]): AlimentoV2[] {
    if (!restrictions || restrictions.length === 0) return foods;

    const forbiddenCats = new Set<string>();
    restrictions.forEach(r => {
      const cats = RESTRICTION_MAP[r.toLowerCase()];
      if (cats) cats.forEach(c => forbiddenCats.add(c));
    });

    if (forbiddenCats.size === 0) return foods;

    return foods.filter(f => !forbiddenCats.has(f.categoria));
  }

  private static rankFoodsByGoal(foods: AlimentoV2[], objective: string): AlimentoV2[] {
    const obj = (objective || '').toLowerCase();
    const isHypertrophy = obj.includes('hipertrofia') || obj.includes('ganho') || obj.includes('massa');
    const isWeightLoss = obj.includes('emagrecimento') || obj.includes('perda') || obj.includes('definicao');

    // Se não tem objetivo claro, retorna aleatório para variar
    if (!isHypertrophy && !isWeightLoss) {
      return foods.sort(() => 0.5 - Math.random());
    }

    return foods.sort((a, b) => {
      const scoreA = this.calculateScore(a, isHypertrophy, isWeightLoss);
      const scoreB = this.calculateScore(b, isHypertrophy, isWeightLoss);
      return scoreB - scoreA; // Maior score primeiro
    });
  }

  private static calculateScore(food: AlimentoV2, isHyper: boolean, isLoss: boolean): number {
    const ptn = food.ptn_g_por_referencia || 0;
    const cho = food.cho_g_por_referencia || 0;
    const lip = food.lip_g_por_referencia || 0;
    const kcal = food.kcal_por_referencia || 1;

    // Fórmula de Scoring Nutricional
    if (isHyper) {
      // Valoriza proteína e carboidrato, não pune tanto caloria
      return (ptn * 3) + (cho * 1.5) + (kcal / 100);
    } 
    
    if (isLoss) {
      // Valoriza proteína (saciedade), pune gordura excessiva e densidade calórica alta
      return (ptn * 4) - (lip * 2) - (kcal / 30);
    }
    
    return 0;
  }

  private static fillMealSlots(
    foods: AlimentoV2[], 
    targetKcal: number, 
    usedIds: Set<string>
  ): ItemRefeicao[] {
    let currentKcal = 0;
    const selectedItems: ItemRefeicao[] = [];
    
    // Pega os top 20 melhores alimentos para o objetivo e embaralha levemente para variedade
    const topCandidates = foods.slice(0, 20).sort(() => 0.5 - Math.random());

    for (const food of topCandidates) {
      // Travas de Segurança
      if (usedIds.has(food.id)) continue;
      if (currentKcal >= targetKcal * MIN_KCAL_PERCENT) break; 
      if (selectedItems.length >= MAX_ITEMS_PER_MEAL) break; 

      const foodKcal = food.kcal_por_referencia || 0;
      if (foodKcal === 0) continue;

      const remaining = targetKcal - currentKcal;
      
      // Cálculo Inteligente de Porção (arredonda para 0.5, 1.0, 1.5, 2.0...)
      let qtd = Math.round((remaining / foodKcal) * 2) / 2;
      
      // Limites fisiológicos de porção
      if (qtd < MIN_PORTION) qtd = MIN_PORTION;
      if (qtd > MAX_PORTION) qtd = MAX_PORTION;

      const itemKcal = foodKcal * qtd;

      // Aceita se não estourar grosseiramente a meta (115%)
      if ((currentKcal + itemKcal) <= targetKcal * MAX_KCAL_PERCENT) {
        selectedItems.push({
          id: crypto.randomUUID(),
          alimento_id: food.id,
          alimento_nome: food.nome,
          medida_utilizada: food.medida_padrao_referencia,
          quantidade: qtd,
          peso_total_g: (food.peso_referencia_g || 0) * qtd,
          kcal_calculado: itemKcal,
          ptn_g_calculado: (food.ptn_g_por_referencia || 0) * qtd,
          cho_g_calculado: (food.cho_g_por_referencia || 0) * qtd,
          lip_g_calculado: (food.lip_g_por_referencia || 0) * qtd,
        });
        
        currentKcal += itemKcal;
        usedIds.add(food.id); // Registra uso global
      }
    }
    
    return selectedItems;
  }
}
