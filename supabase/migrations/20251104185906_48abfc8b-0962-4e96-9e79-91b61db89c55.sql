-- Função para buscar alimentos mais utilizados nos planos alimentares
CREATE OR REPLACE FUNCTION get_most_used_foods(search_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  categoria TEXT,
  medida_padrao_referencia TEXT,
  peso_referencia_g NUMERIC,
  kcal_por_referencia NUMERIC,
  ptn_g_por_referencia NUMERIC,
  cho_g_por_referencia NUMERIC,
  lip_g_por_referencia NUMERIC,
  fibra_g_por_referencia NUMERIC,
  sodio_mg_por_referencia NUMERIC,
  usage_count BIGINT
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
    a.medida_padrao_referencia,
    a.peso_referencia_g,
    a.kcal_por_referencia,
    a.ptn_g_por_referencia,
    a.cho_g_por_referencia,
    a.lip_g_por_referencia,
    a.fibra_g_por_referencia,
    a.sodio_mg_por_referencia,
    COUNT(ir.id) as usage_count
  FROM alimentos_v2 a
  LEFT JOIN itens_refeicao ir ON a.id = ir.alimento_id
  WHERE a.ativo = true
  GROUP BY a.id, a.nome, a.categoria, a.medida_padrao_referencia, 
           a.peso_referencia_g, a.kcal_por_referencia, a.ptn_g_por_referencia,
           a.cho_g_por_referencia, a.lip_g_por_referencia, a.fibra_g_por_referencia,
           a.sodio_mg_por_referencia
  ORDER BY usage_count DESC, a.nome ASC
  LIMIT search_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_most_used_foods(INTEGER) TO authenticated;