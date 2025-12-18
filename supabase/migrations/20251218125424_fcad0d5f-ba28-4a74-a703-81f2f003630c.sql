-- Drop the existing function and recreate without similarity() 
-- since pg_trgm extension may not be available

DROP FUNCTION IF EXISTS search_alimentos_fulltext(text, text, text, integer);

CREATE OR REPLACE FUNCTION search_alimentos_fulltext(
  search_query text DEFAULT '',
  search_category text DEFAULT NULL,
  search_meal_type text DEFAULT NULL,
  max_results integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  nome text,
  categoria text,
  subcategoria text,
  medida_padrao_referencia text,
  peso_referencia_g numeric,
  kcal_por_referencia numeric,
  ptn_g_por_referencia numeric,
  cho_g_por_referencia numeric,
  lip_g_por_referencia numeric,
  fibra_g_por_referencia numeric,
  sodio_mg_por_referencia numeric,
  popularidade integer,
  keywords text[],
  tipo_refeicao_sugerida text[],
  descricao_curta text,
  preparo_sugerido text,
  similarity_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_query text;
BEGIN
  -- Normalize the search query
  normalized_query := LOWER(TRIM(COALESCE(search_query, '')));
  
  RETURN QUERY
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
    -- Calculate relevance score based on text matching
    CASE 
      WHEN normalized_query = '' THEN COALESCE(a.popularidade::numeric, 0)
      WHEN LOWER(a.nome) = normalized_query THEN 100.0
      WHEN LOWER(a.nome) LIKE normalized_query || '%' THEN 90.0
      WHEN LOWER(a.nome) LIKE '%' || normalized_query || '%' THEN 70.0
      WHEN LOWER(COALESCE(a.categoria, '')) LIKE '%' || normalized_query || '%' THEN 50.0
      WHEN EXISTS (
        SELECT 1 FROM unnest(a.keywords) kw WHERE LOWER(kw) LIKE '%' || normalized_query || '%'
      ) THEN 60.0
      ELSE 10.0
    END AS similarity_score
  FROM alimentos_v2 a
  WHERE 
    a.ativo = true
    AND (
      normalized_query = ''
      OR LOWER(a.nome) LIKE '%' || normalized_query || '%'
      OR LOWER(COALESCE(a.categoria, '')) LIKE '%' || normalized_query || '%'
      OR LOWER(COALESCE(a.subcategoria, '')) LIKE '%' || normalized_query || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(a.keywords) kw WHERE LOWER(kw) LIKE '%' || normalized_query || '%'
      )
    )
    AND (search_category IS NULL OR a.categoria = search_category)
    AND (search_meal_type IS NULL OR search_meal_type = ANY(a.tipo_refeicao_sugerida))
  ORDER BY 
    similarity_score DESC,
    COALESCE(a.popularidade, 0) DESC,
    a.nome ASC
  LIMIT max_results;
END;
$$;