-- Habilitar extensão unaccent para busca sem acentos
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Remover função existente para recriar com novo schema
DROP FUNCTION IF EXISTS search_alimentos_fulltext(TEXT, TEXT, TEXT, INTEGER);

-- Recriar a função de busca full-text com suporte a unaccent
CREATE OR REPLACE FUNCTION search_alimentos_fulltext(
  search_query TEXT DEFAULT '',
  search_category TEXT DEFAULT NULL,
  search_meal_type TEXT DEFAULT NULL,
  max_results INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  categoria TEXT,
  subcategoria TEXT,
  medida_padrao_referencia TEXT,
  peso_referencia_g NUMERIC,
  kcal_por_referencia NUMERIC,
  ptn_g_por_referencia NUMERIC,
  cho_g_por_referencia NUMERIC,
  lip_g_por_referencia NUMERIC,
  fibra_g_por_referencia NUMERIC,
  sodio_mg_por_referencia NUMERIC,
  popularidade INTEGER,
  keywords TEXT[],
  tipo_refeicao_sugerida TEXT[],
  descricao_curta TEXT,
  preparo_sugerido TEXT,
  similarity_score REAL
) AS $$
DECLARE
  normalized_query TEXT;
BEGIN
  -- Normalizar a query removendo acentos e convertendo para minúsculas
  normalized_query := LOWER(unaccent(COALESCE(NULLIF(TRIM(search_query), ''), '')));
  
  RETURN QUERY
  WITH scored_foods AS (
    SELECT 
      a.id,
      a.nome,
      a.categoria,
      a.subcategoria,
      a.medida_padrao_referencia,
      a.peso_referencia_g,
      a.kcal_por_referencia,
      a.ptn_g_por_referencia,
      a.cho_g_por_referencia,
      a.lip_g_por_referencia,
      a.fibra_g_por_referencia,
      a.sodio_mg_por_referencia,
      a.popularidade,
      a.keywords,
      a.tipo_refeicao_sugerida,
      a.descricao_curta,
      a.preparo_sugerido,
      CASE 
        -- Se não há query de busca, usar popularidade como score
        WHEN normalized_query = '' THEN COALESCE(a.popularidade, 0)::REAL / 1000.0
        -- Match exato no início do nome (maior peso)
        WHEN LOWER(unaccent(a.nome)) LIKE normalized_query || '%' THEN 1.0
        -- Match exato em qualquer parte do nome
        WHEN LOWER(unaccent(a.nome)) LIKE '%' || normalized_query || '%' THEN 0.8
        -- Match em categoria
        WHEN LOWER(unaccent(a.categoria)) LIKE '%' || normalized_query || '%' THEN 0.5
        -- Match em subcategoria
        WHEN a.subcategoria IS NOT NULL AND LOWER(unaccent(a.subcategoria)) LIKE '%' || normalized_query || '%' THEN 0.4
        -- Match em keywords
        WHEN a.keywords IS NOT NULL AND EXISTS (
          SELECT 1 FROM unnest(a.keywords) AS kw 
          WHERE LOWER(unaccent(kw)) LIKE '%' || normalized_query || '%'
        ) THEN 0.3
        ELSE 0.0
      END AS similarity_score
    FROM alimentos_v2 a
    WHERE a.ativo = true
      -- Filtro de categoria opcional
      AND (search_category IS NULL OR a.categoria = search_category)
      -- Filtro de tipo de refeição opcional
      AND (search_meal_type IS NULL OR a.tipo_refeicao_sugerida @> ARRAY[search_meal_type])
  )
  SELECT 
    sf.id,
    sf.nome,
    sf.categoria,
    sf.subcategoria,
    sf.medida_padrao_referencia,
    sf.peso_referencia_g,
    sf.kcal_por_referencia,
    sf.ptn_g_por_referencia,
    sf.cho_g_por_referencia,
    sf.lip_g_por_referencia,
    sf.fibra_g_por_referencia,
    sf.sodio_mg_por_referencia,
    sf.popularidade,
    sf.keywords,
    sf.tipo_refeicao_sugerida,
    sf.descricao_curta,
    sf.preparo_sugerido,
    sf.similarity_score
  FROM scored_foods sf
  WHERE 
    -- Se há query, exigir algum match
    normalized_query = '' OR sf.similarity_score > 0
  ORDER BY 
    sf.similarity_score DESC,
    COALESCE(sf.popularidade, 0) DESC,
    sf.nome ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;