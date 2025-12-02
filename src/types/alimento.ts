/**
 * CENTRAL ALIMENTO V2 INTERFACE
 * Definição única e centralizada para a tabela alimentos_v2
 */

export interface AlimentoV2 {
  id: string;
  nome: string;
  categoria: string;
  subcategoria?: string;
  medida_padrao_referencia: string;
  peso_referencia_g: number;
  kcal_por_referencia: number;
  ptn_g_por_referencia: number;
  cho_g_por_referencia: number;
  lip_g_por_referencia: number;
  fibra_g_por_referencia?: number;
  sodio_mg_por_referencia?: number;
  keywords?: string[];
  tipo_refeicao_sugerida?: string[];
  popularidade?: number;
  descricao_curta?: string;
  preparo_sugerido?: string;
  // Campos computados (não estão no banco)
  is_favorite?: boolean;
  usage_count?: number;
}
