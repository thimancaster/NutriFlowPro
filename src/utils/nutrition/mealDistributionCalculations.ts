
/**
 * Sistema de 6 Refeições - Fase 3
 * Implementa a distribuição percentual dos macronutrientes nas refeições
 */

import { supabase } from '@/integrations/supabase/client';

export interface RefeicaoDistribuicao {
  id?: string;
  planoNutricionalId: string;
  numeroRefeicao: number;
  nomeRefeicao: string;
  horarioSugerido?: string;
  
  // Percentuais de distribuição
  ptnPercentual: number;
  lipPercentual: number;
  choPercentual: number;
  
  // Valores calculados em gramas
  ptnG: number;
  lipG: number;
  choG: number;
  kcalTotal: number;
}

export interface DistribuicaoCompleta {
  planoNutricionalId: string;
  refeicoes: RefeicaoDistribuicao[];
  totalPtnG: number;
  totalLipG: number;
  totalChoG: number;
  totalKcal: number;
}

// Distribuição padrão das 6 refeições conforme planilha
export const REFEICOES_PADRAO = [
  {
    numeroRefeicao: 1,
    nomeRefeicao: 'Café da manhã',
    horarioSugerido: '07:00',
    ptnPercentual: 20,
    lipPercentual: 15,
    choPercentual: 25
  },
  {
    numeroRefeicao: 2,
    nomeRefeicao: 'Lanche da manhã',
    horarioSugerido: '10:00',
    ptnPercentual: 10,
    lipPercentual: 10,
    choPercentual: 15
  },
  {
    numeroRefeicao: 3,
    nomeRefeicao: 'Almoço',
    horarioSugerido: '12:30',
    ptnPercentual: 35,
    lipPercentual: 40,
    choPercentual: 30
  },
  {
    numeroRefeicao: 4,
    nomeRefeicao: 'Lanche da tarde',
    horarioSugerido: '15:30',
    ptnPercentual: 10,
    lipPercentual: 10,
    choPercentual: 10
  },
  {
    numeroRefeicao: 5,
    nomeRefeicao: 'Jantar',
    horarioSugerido: '19:00',
    ptnPercentual: 20,
    lipPercentual: 20,
    choPercentual: 18
  },
  {
    numeroRefeicao: 6,
    nomeRefeicao: 'Ceia',
    horarioSugerido: '21:30',
    ptnPercentual: 5,
    lipPercentual: 5,
    choPercentual: 2
  }
];

/**
 * Calcula distribuição das refeições baseada nos macronutrientes totais
 */
export function calcularDistribuicaoRefeicoes(
  planoNutricionalId: string,
  totalPtnG: number,
  totalLipG: number,
  totalChoG: number,
  distribuicaoPersonalizada?: Partial<RefeicaoDistribuicao>[]
): RefeicaoDistribuicao[] {
  
  const distribuicaoBase = distribuicaoPersonalizada || REFEICOES_PADRAO;
  
  return distribuicaoBase.map((refeicao, index) => {
    const ref = REFEICOES_PADRAO[index] || refeicao;
    
    // Calcular gramas baseado no percentual
    const ptnG = Math.round((totalPtnG * (refeicao.ptnPercentual || ref.ptnPercentual) / 100) * 10) / 10;
    const lipG = Math.round((totalLipG * (refeicao.lipPercentual || ref.lipPercentual) / 100) * 10) / 10;
    const choG = Math.round((totalChoG * (refeicao.choPercentual || ref.choPercentual) / 100) * 10) / 10;
    
    // Calcular calorias totais da refeição
    const kcalTotal = Math.round((ptnG * 4) + (lipG * 9) + (choG * 4));
    
    return {
      id: refeicao.id,
      planoNutricionalId,
      numeroRefeicao: refeicao.numeroRefeicao || ref.numeroRefeicao,
      nomeRefeicao: refeicao.nomeRefeicao || ref.nomeRefeicao,
      horarioSugerido: refeicao.horarioSugerido || ref.horarioSugerido,
      ptnPercentual: refeicao.ptnPercentual || ref.ptnPercentual,
      lipPercentual: refeicao.lipPercentual || ref.lipPercentual,
      choPercentual: refeicao.choPercentual || ref.choPercentual,
      ptnG,
      lipG,
      choG,
      kcalTotal
    };
  });
}

/**
 * Salva distribuição de refeições no banco
 */
export async function salvarDistribuicaoRefeicoes(refeicoes: RefeicaoDistribuicao[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const refeicoesParaSalvar = refeicoes.map(refeicao => ({
      id: refeicao.id,
      plano_nutricional_id: refeicao.planoNutricionalId,
      numero_refeicao: refeicao.numeroRefeicao,
      nome_refeicao: refeicao.nomeRefeicao,
      horario_sugerido: refeicao.horarioSugerido,
      ptn_percentual: refeicao.ptnPercentual,
      lip_percentual: refeicao.lipPercentual,
      cho_percentual: refeicao.choPercentual,
      ptn_g: refeicao.ptnG,
      lip_g: refeicao.lipG,
      cho_g: refeicao.choG,
      kcal_total: refeicao.kcalTotal,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('refeicoes_distribuicao')
      .upsert(refeicoesParaSalvar)
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao salvar distribuição de refeições:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca distribuição de refeições por plano nutricional
 */
export async function buscarDistribuicaoRefeicoes(planoNutricionalId: string): Promise<RefeicaoDistribuicao[]> {
  try {
    const { data, error } = await supabase
      .from('refeicoes_distribuicao')
      .select('*')
      .eq('plano_nutricional_id', planoNutricionalId)
      .order('numero_refeicao');

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      planoNutricionalId: item.plano_nutricional_id,
      numeroRefeicao: item.numero_refeicao,
      nomeRefeicao: item.nome_refeicao,
      horarioSugerido: item.horario_sugerido,
      ptnPercentual: item.ptn_percentual,
      lipPercentual: item.lip_percentual,
      choPercentual: item.cho_percentual,
      ptnG: item.ptn_g,
      lipG: item.lip_g,
      choG: item.cho_g,
      kcalTotal: item.kcal_total
    }));
  } catch (error: any) {
    console.error('Erro ao buscar distribuição de refeições:', error);
    return [];
  }
}

/**
 * Valida se os percentuais somam 100% para cada macronutriente
 */
export function validarDistribuicaoRefeicoes(refeicoes: RefeicaoDistribuicao[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Somar percentuais
  const totalPtnPercentual = refeicoes.reduce((sum, r) => sum + r.ptnPercentual, 0);
  const totalLipPercentual = refeicoes.reduce((sum, r) => sum + r.lipPercentual, 0);
  const totalChoPercentual = refeicoes.reduce((sum, r) => sum + r.choPercentual, 0);

  // Validar se somam 100% (com tolerância de ±1%)
  if (Math.abs(totalPtnPercentual - 100) > 1) {
    errors.push(`Proteína: ${totalPtnPercentual}% (deve somar 100%)`);
  }
  
  if (Math.abs(totalLipPercentual - 100) > 1) {
    errors.push(`Lipídio: ${totalLipPercentual}% (deve somar 100%)`);
  }
  
  if (Math.abs(totalChoPercentual - 100) > 1) {
    errors.push(`Carboidrato: ${totalChoPercentual}% (deve somar 100%)`);
  }

  // Validar se há 6 refeições
  if (refeicoes.length !== 6) {
    errors.push('Deve haver exatamente 6 refeições');
  }

  // Validar valores individuais
  refeicoes.forEach((refeicao, index) => {
    if (refeicao.ptnPercentual < 0 || refeicao.ptnPercentual > 100) {
      errors.push(`Refeição ${index + 1}: percentual de proteína inválido (${refeicao.ptnPercentual}%)`);
    }
    if (refeicao.lipPercentual < 0 || refeicao.lipPercentual > 100) {
      errors.push(`Refeição ${index + 1}: percentual de lipídio inválido (${refeicao.lipPercentual}%)`);
    }
    if (refeicao.choPercentual < 0 || refeicao.choPercentual > 100) {
      errors.push(`Refeição ${index + 1}: percentual de carboidrato inválido (${refeicao.choPercentual}%)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gera distribuição padrão das 6 refeições
 */
export function gerarDistribuicaoPadrao(
  planoNutricionalId: string,
  totalPtnG: number,
  totalLipG: number,
  totalChoG: number
): RefeicaoDistribuicao[] {
  return calcularDistribuicaoRefeicoes(planoNutricionalId, totalPtnG, totalLipG, totalChoG);
}
