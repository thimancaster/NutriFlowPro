
/**
 * Sistema de Macronutrientes Diários - Fase 2
 * Implementa o cálculo de macronutrientes baseado na planilha
 */

import { supabase } from '@/integrations/supabase/client';

export interface MacronutrientInputs {
  vetKcal: number;
  peso: number;
  
  // Proteína
  proteinaTipoDefinicao: 'g_kg' | 'g_dia';
  proteinaValor: number; // valor inserido pelo usuário
  
  // Lipídio
  lipidioTipoDefinicao: 'g_kg' | 'g_dia';
  lipidioValor: number; // valor inserido pelo usuário
}

export interface MacronutrientResult {
  vetKcal: number;
  
  // Proteína
  proteinaGDia: number;
  proteinaKcal: number;
  proteinaPercentual: number;
  
  // Lipídio
  lipidioGDia: number;
  lipidioKcal: number;
  lipidioPercentual: number;
  
  // Carboidrato (calculado por diferença)
  carboidratoGDia: number;
  carboidratoKcal: number;
  carboidratoPercentual: number;
}

export interface PlanoNutricionalDiario {
  id?: string;
  calculationId?: string;
  userId: string;
  patientId?: string;
  vetKcal: number;
  
  // Proteína
  ptnTipoDefinicao: 'g_kg' | 'g_dia';
  ptnValor: number;
  ptnGDia: number;
  ptnKcal: number;
  ptnPercentual: number;
  
  // Lipídio
  lipTipoDefinicao: 'g_kg' | 'g_dia';
  lipValor: number;
  lipGDia: number;
  lipKcal: number;
  lipPercentual: number;
  
  // Carboidrato
  choGDia: number;
  choKcal: number;
  choPercentual: number;
}

/**
 * Calcula macronutrientes seguindo a lógica da planilha
 */
export function calcularMacronutrientes(inputs: MacronutrientInputs): MacronutrientResult {
  const { vetKcal, peso, proteinaTipoDefinicao, proteinaValor, lipidioTipoDefinicao, lipidioValor } = inputs;
  
  // Calcular proteína em gramas/dia
  let proteinaGDia: number;
  if (proteinaTipoDefinicao === 'g_kg') {
    proteinaGDia = proteinaValor * peso;
  } else {
    proteinaGDia = proteinaValor;
  }
  
  // Calcular lipídio em gramas/dia
  let lipidioGDia: number;
  if (lipidioTipoDefinicao === 'g_kg') {
    lipidioGDia = lipidioValor * peso;
  } else {
    lipidioGDia = lipidioValor;
  }
  
  // Calcular calorias dos macronutrientes
  const proteinaKcal = proteinaGDia * 4;
  const lipidioKcal = lipidioGDia * 9;
  
  // Calcular carboidrato por diferença
  const carboidratoKcal = vetKcal - proteinaKcal - lipidioKcal;
  const carboidratoGDia = carboidratoKcal / 4;
  
  // Calcular percentuais
  const proteinaPercentual = (proteinaKcal / vetKcal) * 100;
  const lipidioPercentual = (lipidioKcal / vetKcal) * 100;
  const carboidratoPercentual = (carboidratoKcal / vetKcal) * 100;
  
  return {
    vetKcal,
    proteinaGDia: Math.round(proteinaGDia * 10) / 10,
    proteinaKcal: Math.round(proteinaKcal),
    proteinaPercentual: Math.round(proteinaPercentual * 10) / 10,
    lipidioGDia: Math.round(lipidioGDia * 10) / 10,
    lipidioKcal: Math.round(lipidioKcal),
    lipidioPercentual: Math.round(lipidioPercentual * 10) / 10,
    carboidratoGDia: Math.round(carboidratoGDia * 10) / 10,
    carboidratoKcal: Math.round(carboidratoKcal),
    carboidratoPercentual: Math.round(carboidratoPercentual * 10) / 10
  };
}

/**
 * Salva plano nutricional diário no banco
 */
export async function salvarPlanoNutricionalDiario(plano: PlanoNutricionalDiario): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('plano_nutricional_diario')
      .upsert({
        id: plano.id,
        calculation_id: plano.calculationId,
        user_id: plano.userId,
        patient_id: plano.patientId,
        vet_kcal: plano.vetKcal,
        ptn_tipo_definicao: plano.ptnTipoDefinicao,
        ptn_valor: plano.ptnValor,
        ptn_g_dia: plano.ptnGDia,
        ptn_kcal: plano.ptnKcal,
        ptn_percentual: plano.ptnPercentual,
        lip_tipo_definicao: plano.lipTipoDefinicao,
        lip_valor: plano.lipValor,
        lip_g_dia: plano.lipGDia,
        lip_kcal: plano.lipKcal,
        lip_percentual: plano.lipPercentual,
        cho_g_dia: plano.choGDia,
        cho_kcal: plano.choKcal,
        cho_percentual: plano.choPercentual,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao salvar plano nutricional:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca plano nutricional por calculation_id
 */
export async function buscarPlanoNutricionalPorCalculation(calculationId: string): Promise<PlanoNutricionalDiario | null> {
  try {
    const { data, error } = await supabase
      .from('plano_nutricional_diario')
      .select('*')
      .eq('calculation_id', calculationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) return null;

    return {
      id: data.id,
      calculationId: data.calculation_id,
      userId: data.user_id,
      patientId: data.patient_id,
      vetKcal: data.vet_kcal,
      ptnTipoDefinicao: data.ptn_tipo_definicao as 'g_kg' | 'g_dia',
      ptnValor: data.ptn_valor,
      ptnGDia: data.ptn_g_dia,
      ptnKcal: data.ptn_kcal,
      ptnPercentual: data.ptn_percentual,
      lipTipoDefinicao: data.lip_tipo_definicao as 'g_kg' | 'g_dia',
      lipValor: data.lip_valor,
      lipGDia: data.lip_g_dia,
      lipKcal: data.lip_kcal,
      lipPercentual: data.lip_percentual,
      choGDia: data.cho_g_dia,
      choKcal: data.cho_kcal,
      choPercentual: data.cho_percentual
    };
  } catch (error: any) {
    console.error('Erro ao buscar plano nutricional:', error);
    return null;
  }
}

/**
 * Valida inputs de macronutrientes
 */
export function validarInputsMacronutrientes(inputs: MacronutrientInputs): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!inputs.vetKcal || inputs.vetKcal <= 0) {
    errors.push('VET deve ser maior que zero');
  }

  if (!inputs.peso || inputs.peso <= 0) {
    errors.push('Peso deve ser maior que zero');
  }

  if (!inputs.proteinaValor || inputs.proteinaValor <= 0) {
    errors.push('Valor da proteína deve ser maior que zero');
  }

  if (!inputs.lipidioValor || inputs.lipidioValor <= 0) {
    errors.push('Valor do lipídio deve ser maior que zero');
  }

  // Validar se a soma das calorias de proteína e lipídio não excedem o VET
  const peso = inputs.peso || 0;
  const proteinaGDia = inputs.proteinaTipoDefinicao === 'g_kg' ? inputs.proteinaValor * peso : inputs.proteinaValor;
  const lipidioGDia = inputs.lipidioTipoDefinicao === 'g_kg' ? inputs.lipidioValor * peso : inputs.lipidioValor;
  
  const proteinaKcal = proteinaGDia * 4;
  const lipidioKcal = lipidioGDia * 9;
  
  if (proteinaKcal + lipidioKcal >= inputs.vetKcal) {
    errors.push('A soma das calorias de proteína e lipídio deve ser menor que o VET');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
