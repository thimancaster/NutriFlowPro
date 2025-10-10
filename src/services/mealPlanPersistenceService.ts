/**
 * MEAL PLAN PERSISTENCE SERVICE - Supabase Integration
 * Handles complete meal plan data persistence across all relevant tables
 */

import { supabase } from '@/integrations/supabase/client';

export interface PlanoNutricionalDiarioData {
  user_id: string;
  patient_id: string;
  calculation_id?: string;
  vet_kcal: number;
  ptn_tipo_definicao: 'g_kg' | 'percentual';
  ptn_valor: number; // g/kg or %
  ptn_g_dia: number;
  ptn_kcal: number;
  ptn_percentual: number;
  lip_tipo_definicao: 'g_kg' | 'percentual';
  lip_valor: number; // g/kg or %
  lip_g_dia: number;
  lip_kcal: number;
  lip_percentual: number;
  cho_g_dia: number;
  cho_kcal: number;
  cho_percentual: number;
}

export interface RefeicaoDistribuicaoData {
  plano_nutricional_id: string;
  numero_refeicao: number;
  nome_refeicao: string;
  horario_sugerido?: string;
  ptn_percentual: number;
  lip_percentual: number;
  cho_percentual: number;
  ptn_g: number;
  lip_g: number;
  cho_g: number;
  kcal_total: number;
}

export interface ItemRefeicaoData {
  refeicao_id: string;
  alimento_id: string;
  quantidade: number;
  medida_utilizada: string;
  peso_total_g: number;
  kcal_calculado: number;
  ptn_g_calculado: number;
  lip_g_calculado: number;
  cho_g_calculado: number;
  ordem: number;
}

/**
 * Save or update daily nutritional plan
 */
export async function savePlanoNutricionalDiario(data: PlanoNutricionalDiarioData): Promise<string> {
  try {
    const { data: result, error } = await supabase
      .from('plano_nutricional_diario')
      .insert([data])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving plano_nutricional_diario:', error);
      throw new Error('Erro ao salvar plano nutricional diário');
    }

    console.log('[PERSISTENCE] Plano nutricional saved:', result.id);
    return result.id;
  } catch (error) {
    console.error('Exception in savePlanoNutricionalDiario:', error);
    throw error;
  }
}

/**
 * Save meal distributions for a nutritional plan
 */
export async function saveRefeicaoDistribuicao(
  refeicoes: RefeicaoDistribuicaoData[]
): Promise<void> {
  try {
    const { error } = await supabase
      .from('refeicoes_distribuicao')
      .insert(refeicoes);

    if (error) {
      console.error('Error saving refeicoes_distribuicao:', error);
      throw new Error('Erro ao salvar distribuição de refeições');
    }

    console.log('[PERSISTENCE] Meal distributions saved:', refeicoes.length);
  } catch (error) {
    console.error('Exception in saveRefeicaoDistribuicao:', error);
    throw error;
  }
}

/**
 * Save individual meal items
 */
export async function saveItensRefeicao(itens: ItemRefeicaoData[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('itens_refeicao')
      .insert(itens);

    if (error) {
      console.error('Error saving itens_refeicao:', error);
      throw new Error('Erro ao salvar itens de refeição');
    }

    console.log('[PERSISTENCE] Meal items saved:', itens.length);
  } catch (error) {
    console.error('Exception in saveItensRefeicao:', error);
    throw error;
  }
}

/**
 * Update meal items for a specific meal
 */
export async function updateItemRefeicao(
  itemId: string,
  updates: Partial<ItemRefeicaoData>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('itens_refeicao')
      .update(updates)
      .eq('id', itemId);

    if (error) {
      console.error('Error updating item_refeicao:', error);
      throw new Error('Erro ao atualizar item de refeição');
    }

    console.log('[PERSISTENCE] Meal item updated:', itemId);
  } catch (error) {
    console.error('Exception in updateItemRefeicao:', error);
    throw error;
  }
}

/**
 * Delete a meal item
 */
export async function deleteItemRefeicao(itemId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('itens_refeicao')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item_refeicao:', error);
      throw new Error('Erro ao deletar item de refeição');
    }

    console.log('[PERSISTENCE] Meal item deleted:', itemId);
  } catch (error) {
    console.error('Exception in deleteItemRefeicao:', error);
    throw error;
  }
}

/**
 * Complete meal plan persistence workflow
 * Saves all data in correct order with proper relationships
 */
export async function persistCompleteMealPlan(
  planoData: PlanoNutricionalDiarioData,
  refeicoes: Omit<RefeicaoDistribuicaoData, 'plano_nutricional_id'>[],
  itensMap: Record<number, Omit<ItemRefeicaoData, 'refeicao_id'>[]>
): Promise<{ planoId: string; success: boolean }> {
  try {
    // Step 1: Save daily plan
    const planoId = await savePlanoNutricionalDiario(planoData);

    // Step 2: Save meal distributions with plano_id
    const refeicoesWithId: RefeicaoDistribuicaoData[] = refeicoes.map(ref => ({
      ...ref,
      plano_nutricional_id: planoId
    }));
    await saveRefeicaoDistribuicao(refeicoesWithId);

    // Step 3: Get created meal IDs
    const { data: createdRefeicoes, error: fetchError } = await supabase
      .from('refeicoes_distribuicao')
      .select('id, numero_refeicao')
      .eq('plano_nutricional_id', planoId)
      .order('numero_refeicao');

    if (fetchError || !createdRefeicoes) {
      throw new Error('Erro ao buscar IDs das refeições criadas');
    }

    // Step 4: Save meal items with refeicao_id
    const allItens: ItemRefeicaoData[] = [];
    createdRefeicoes.forEach(ref => {
      const itens = itensMap[ref.numero_refeicao] || [];
      itens.forEach(item => {
        allItens.push({
          ...item,
          refeicao_id: ref.id
        });
      });
    });

    if (allItens.length > 0) {
      await saveItensRefeicao(allItens);
    }

    console.log('[PERSISTENCE] Complete meal plan saved successfully:', planoId);
    return { planoId, success: true };
  } catch (error) {
    console.error('[PERSISTENCE] Error in complete workflow:', error);
    throw error;
  }
}
