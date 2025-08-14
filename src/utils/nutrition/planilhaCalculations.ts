
/**
 * Sistema de Cálculos da Planilha - Fase 1
 * Implementa as fórmulas exatas conforme a planilha original
 */

import { supabase } from '@/integrations/supabase/client';

export interface ParametrosPlanilha {
  id: string;
  perfil: 'magro' | 'obeso_sobrepeso' | 'atleta_musculoso';
  sexo: 'masculino' | 'feminino' | 'ambos';
  tmb_base_valor: number;
  fa_valor: number;
  formula_tmb_detalhe: string;
  formula_get_detalhe: string;
}

export interface CalculoPlanilhaInputs {
  peso: number;
  altura: number;
  idade: number;
  sexo: 'M' | 'F';
  perfil_get: 'magro' | 'obeso_sobrepeso' | 'atleta_musculoso';
  superavit_deficit_calorico?: number;
}

export interface CalculoPlanilhaResult {
  tmb: number;
  get: number;
  vet: number;
  parametros_utilizados: ParametrosPlanilha;
  formula_aplicada: string;
}

/**
 * Busca os parâmetros da planilha no banco de dados
 */
export async function buscarParametrosPlanilha(
  perfil: string,
  sexo: 'M' | 'F'
): Promise<ParametrosPlanilha | null> {
  const sexoMapeado = sexo === 'M' ? 'masculino' : 'feminino';
  
  let query = supabase
    .from('parametros_get_planilha')
    .select('*')
    .eq('perfil', perfil);

  // Para atletas, usar 'ambos', para outros perfis usar sexo específico
  if (perfil === 'atleta_musculoso') {
    query = query.eq('sexo', 'ambos');
  } else {
    query = query.eq('sexo', sexoMapeado);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('Erro ao buscar parâmetros da planilha:', error);
    return null;
  }

  return data as ParametrosPlanilha;
}

/**
 * Calcula TMB usando as fórmulas exatas da planilha
 */
export function calcularTMBPlanilha(
  peso: number,
  altura: number,
  idade: number,
  sexo: 'M' | 'F',
  parametros: ParametrosPlanilha
): number {
  const { perfil, tmb_base_valor } = parametros;

  switch (perfil) {
    case 'magro':
      // Harris-Benedict exata da planilha
      if (sexo === 'F') {
        // 655 + (9.6 * peso) + (1.9 * altura) - (4.7 * idade)
        return 655 + (9.6 * peso) + (1.9 * altura) - (4.7 * idade);
      } else {
        // 66 + (13.8 * peso) + (5 * altura) - (6.8 * idade)
        return 66 + (13.8 * peso) + (5 * altura) - (6.8 * idade);
      }

    case 'obeso_sobrepeso':
      // Mifflin-St Jeor exata da planilha
      if (sexo === 'F') {
        // (10 * peso) + (6.25 * altura) - (5 * idade) - 161
        return (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
      } else {
        // (10 * peso) + (6.25 * altura) - (5 * idade) + 5
        return (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
      }

    case 'atleta_musculoso':
      // Fórmula específica para atletas: 24.8 * peso + 10
      return 24.8 * peso + 10;

    default:
      throw new Error(`Perfil não reconhecido: ${perfil}`);
  }
}

/**
 * Calcula GET usando fator de atividade da planilha
 */
export function calcularGETPlanilha(tmb: number, parametros: ParametrosPlanilha): number {
  return tmb * parametros.fa_valor;
}

/**
 * Calcula VET aplicando superávit/déficit calórico
 */
export function calcularVETPlanilha(
  get: number,
  superavit_deficit_calorico: number = 0
): number {
  return get + superavit_deficit_calorico;
}

/**
 * Função principal para cálculo completo usando lógica da planilha
 */
export async function calcularNutricaoPlanilha(
  inputs: CalculoPlanilhaInputs
): Promise<CalculoPlanilhaResult> {
  const { peso, altura, idade, sexo, perfil_get, superavit_deficit_calorico = 0 } = inputs;

  // Buscar parâmetros da planilha
  const parametros = await buscarParametrosPlanilha(perfil_get, sexo);
  
  if (!parametros) {
    throw new Error(`Parâmetros não encontrados para perfil: ${perfil_get}, sexo: ${sexo}`);
  }

  // Calcular TMB usando fórmula exata da planilha
  const tmb = calcularTMBPlanilha(peso, altura, idade, sexo, parametros);

  // Calcular GET usando fator de atividade da planilha
  const get = calcularGETPlanilha(tmb, parametros);

  // Calcular VET aplicando superávit/déficit
  const vet = calcularVETPlanilha(get, superavit_deficit_calorico);

  return {
    tmb: Math.round(tmb),
    get: Math.round(get),
    vet: Math.round(vet),
    parametros_utilizados: parametros,
    formula_aplicada: parametros.formula_tmb_detalhe
  };
}

/**
 * Validação dos inputs da planilha
 */
export function validarInputsPlanilha(inputs: CalculoPlanilhaInputs): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  if (!inputs.peso || inputs.peso <= 0) {
    errors.push('Peso deve ser maior que zero');
  }
  
  if (!inputs.altura || inputs.altura <= 0) {
    errors.push('Altura deve ser maior que zero');
  }
  
  if (!inputs.idade || inputs.idade <= 0) {
    errors.push('Idade deve ser maior que zero');
  }

  if (!['M', 'F'].includes(inputs.sexo)) {
    errors.push('Sexo deve ser M ou F');
  }

  if (!['magro', 'obeso_sobrepeso', 'atleta_musculoso'].includes(inputs.perfil_get)) {
    errors.push('Perfil GET inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
