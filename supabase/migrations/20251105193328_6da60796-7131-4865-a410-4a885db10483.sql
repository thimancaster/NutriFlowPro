-- Fix: Update get_user_most_used_foods to return all required fields for AlimentoV2 interface

DROP FUNCTION IF EXISTS get_user_most_used_foods(UUID, INTEGER);

CREATE OR REPLACE FUNCTION get_user_most_used_foods(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  nome TEXT,
  categoria TEXT,
  subcategoria TEXT,
  kcal_por_referencia NUMERIC,
  ptn_g_por_referencia NUMERIC,
  cho_g_por_referencia NUMERIC,
  lip_g_por_referencia NUMERIC,
  fibra_g_por_referencia NUMERIC,
  sodio_mg_por_referencia NUMERIC,
  medida_padrao_referencia TEXT,
  peso_referencia_g NUMERIC,
  keywords TEXT[],
  tipo_refeicao_sugerida TEXT[],
  popularidade INTEGER,
  descricao_curta TEXT,
  preparo_sugerido TEXT,
  usage_count BIGINT,
  is_favorite BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.nome,
    a.categoria,
    a.subcategoria,
    a.kcal_por_referencia,
    a.ptn_g_por_referencia,
    a.cho_g_por_referencia,
    a.lip_g_por_referencia,
    a.fibra_g_por_referencia,
    a.sodio_mg_por_referencia,
    a.medida_padrao_referencia,
    a.peso_referencia_g,
    a.keywords,
    a.tipo_refeicao_sugerida,
    a.popularidade,
    a.descricao_curta,
    a.preparo_sugerido,
    COUNT(fuh.id) as usage_count,
    EXISTS(
      SELECT 1 FROM user_favorite_foods uff 
      WHERE uff.user_id = p_user_id AND uff.alimento_id = a.id
    ) as is_favorite
  FROM alimentos_v2 a
  LEFT JOIN food_usage_history fuh ON a.id = fuh.alimento_id AND fuh.user_id = p_user_id
  WHERE a.ativo = true
  GROUP BY a.id
  ORDER BY usage_count DESC, a.popularidade DESC, a.nome ASC
  LIMIT p_limit;
END;
$$;