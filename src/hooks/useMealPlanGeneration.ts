import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Refeicao, ItemRefeicao, AlimentoV2 } from '@/hooks/useMealPlanCalculations';

// Mapeamento de nomes de refeições para tipos no banco (tipo_refeicao_sugerida)
const MEAL_TYPE_MAP: Record<string, string[]> = {
  "Café da Manhã": ["cafe_da_manha", "any"],
  "Lanche da Manhã": ["lanche_manha", "lanche", "any"],
  "Almoço": ["almoco", "any"],
  "Lanche da Tarde": ["lanche_tarde", "lanche", "any"],
  "Jantar": ["jantar", "any"],
  "Ceia": ["lanche", "any"]
};

// Limites do algoritmo greedy
const MAX_ITEMS_PER_MEAL = 4;
const MIN_KCAL_PERCENT = 0.85;
const MAX_KCAL_PERCENT = 1.15;

export const useMealPlanGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  /**
   * Gera sugestões automáticas de alimentos para refeições vazias
   * Usa o campo tipo_refeicao_sugerida do banco alimentos_v2
   */
  const generateMealPlan = useCallback(async (
    currentRefeicoes: Refeicao[],
    patientId: string
  ): Promise<Refeicao[]> => {
    console.log('[MEALPLAN:GENERATION] 🚀 Iniciando geração inteligente...');
    console.log('[MEALPLAN:GENERATION] Refeições recebidas:', currentRefeicoes.length);
    setIsGenerating(true);
    
    try {
      // Cria uma cópia profunda das refeições para não mutar o estado diretamente
      const newRefeicoes: Refeicao[] = JSON.parse(JSON.stringify(currentRefeicoes));
      let mealsGenerated = 0;

      // Para cada refeição, buscar sugestões se ela estiver vazia
      for (const refeicao of newRefeicoes) {
        // Pula se já tiver itens (preserva escolhas manuais)
        if (refeicao.itens.length > 0) {
          console.log(`[MEALPLAN:GENERATION] Pulando ${refeicao.nome} - já tem ${refeicao.itens.length} itens`);
          continue;
        }

        const targetKcal = refeicao.alvo_kcal;
        if (targetKcal <= 0) {
          console.log(`[MEALPLAN:GENERATION] Pulando ${refeicao.nome} - alvo kcal = ${targetKcal}`);
          continue;
        }

        // 1. Buscar alimentos candidatos usando tipo_refeicao_sugerida
        const mealTypes = MEAL_TYPE_MAP[refeicao.nome] || ["any"];
        console.log(`[MEALPLAN:GENERATION] Buscando alimentos para ${refeicao.nome} com tipos:`, mealTypes);
        
        const { data: foods, error } = await supabase
          .from('alimentos_v2')
          .select('*')
          .eq('ativo', true)
          .overlaps('tipo_refeicao_sugerida', mealTypes)
          .limit(30);

        if (error) {
          console.error(`[MEALPLAN:GENERATION] Erro ao buscar alimentos para ${refeicao.nome}:`, error);
          continue;
        }

        if (!foods || foods.length === 0) {
          console.log(`[MEALPLAN:GENERATION] Nenhum alimento encontrado para ${refeicao.nome}`);
          continue;
        }

        console.log(`[MEALPLAN:GENERATION] ${foods.length} alimentos candidatos para ${refeicao.nome}`);

        // 2. Algoritmo Greedy de Preenchimento
        const selectedItems = greedyFillMeal(foods as AlimentoV2[], targetKcal);
        
        if (selectedItems.length > 0) {
          refeicao.itens = selectedItems;
          mealsGenerated++;
          console.log(`[MEALPLAN:GENERATION] ✅ ${refeicao.nome}: ${selectedItems.length} itens adicionados`);
        }
      }
      
      if (mealsGenerated > 0) {
        toast({
          title: "Sugestão Gerada",
          description: `${mealsGenerated} refeição(ões) preenchida(s) com sugestões automáticas.`,
        });
      } else {
        toast({
          title: "Nenhuma refeição gerada",
          description: "Todas as refeições já possuem itens ou não há alimentos compatíveis.",
          variant: "default"
        });
      }

      console.log('[MEALPLAN:GENERATION] ✅ Geração concluída');
      return newRefeicoes;

    } catch (error: any) {
      console.error('[MEALPLAN:GENERATION] ❌ Erro crítico:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar sugestões automáticas.",
        variant: "destructive"
      });
      return currentRefeicoes;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  return {
    isGenerating,
    generateMealPlan
  };
};

/**
 * Algoritmo Greedy para preencher uma refeição até atingir a meta calórica
 */
function greedyFillMeal(foods: AlimentoV2[], targetKcal: number): ItemRefeicao[] {
  const selectedItems: ItemRefeicao[] = [];
  let currentKcal = 0;

  // Embaralha os alimentos para variedade
  const shuffledFoods = [...foods].sort(() => 0.5 - Math.random());

  for (const food of shuffledFoods) {
    // Se já atingiu a meta mínima, para
    if (currentKcal >= targetKcal * MIN_KCAL_PERCENT) break;
    
    // Limite de itens por refeição automática
    if (selectedItems.length >= MAX_ITEMS_PER_MEAL) break;

    const foodKcal = food.kcal_por_referencia || 0;
    if (foodKcal === 0) continue;

    // Calcula quanto falta para a meta
    const remaining = targetKcal - currentKcal;
    
    // Calcula quantidade ideal
    let qtd = remaining / foodKcal;
    
    // Arredonda para 0.5, 1, 1.5 ou 2 (porções razoáveis)
    qtd = Math.round(qtd * 2) / 2;
    if (qtd < 0.5) qtd = 0.5;
    if (qtd > 2) qtd = 2; // Teto de segurança

    // Calcula valores do item
    const kcalItem = foodKcal * qtd;
    
    // Só adiciona se não estourar muito a meta
    if ((currentKcal + kcalItem) <= targetKcal * MAX_KCAL_PERCENT) {
      selectedItems.push({
        id: crypto.randomUUID(),
        alimento_id: food.id,
        alimento_nome: food.nome,
        medida_utilizada: food.medida_padrao_referencia,
        quantidade: qtd,
        peso_total_g: (food.peso_referencia_g || 0) * qtd,
        kcal_calculado: kcalItem,
        ptn_g_calculado: (food.ptn_g_por_referencia || 0) * qtd,
        cho_g_calculado: (food.cho_g_por_referencia || 0) * qtd,
        lip_g_calculado: (food.lip_g_por_referencia || 0) * qtd,
      });
      currentKcal += kcalItem;
    }
  }

  return selectedItems;
}
