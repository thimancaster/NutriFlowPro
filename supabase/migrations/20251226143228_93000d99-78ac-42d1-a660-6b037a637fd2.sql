-- Fix SQL injection vulnerability in search_alimentos_fulltext function
-- Drop and recreate to fix return type issue

DROP FUNCTION IF EXISTS public.search_alimentos_fulltext(TEXT, TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION public.search_alimentos_fulltext(
  search_query TEXT DEFAULT NULL,
  search_category TEXT DEFAULT NULL,
  search_meal_type TEXT DEFAULT NULL,
  max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
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
  peso_referencia_g NUMERIC,
  medida_padrao_referencia TEXT,
  descricao_curta TEXT,
  preparo_sugerido TEXT,
  tipo_refeicao_sugerida TEXT[],
  keywords TEXT[],
  popularidade INTEGER,
  similarity_score REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_query TEXT;
  safe_query TEXT;
BEGIN
  -- Normalize and ESCAPE special LIKE pattern characters to prevent SQL injection
  IF search_query IS NOT NULL AND LENGTH(TRIM(search_query)) > 0 THEN
    -- First escape backslashes, then %, then _
    safe_query := TRIM(search_query);
    safe_query := REPLACE(safe_query, '\', '\\');
    safe_query := REPLACE(safe_query, '%', '\%');
    safe_query := REPLACE(safe_query, '_', '\_');
    -- Now lowercase and remove accents
    normalized_query := LOWER(unaccent(safe_query));
  ELSE
    normalized_query := NULL;
  END IF;

  -- Limit max_results to prevent DoS
  max_results := LEAST(GREATEST(max_results, 1), 200);

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
    a.peso_referencia_g,
    a.medida_padrao_referencia,
    a.descricao_curta,
    a.preparo_sugerido,
    a.tipo_refeicao_sugerida,
    a.keywords,
    a.popularidade,
    CASE
      WHEN normalized_query IS NULL THEN 1.0
      WHEN LOWER(unaccent(a.nome)) LIKE '%' || normalized_query || '%' ESCAPE '\' THEN 0.8
      WHEN a.keywords IS NOT NULL AND EXISTS (
        SELECT 1 FROM unnest(a.keywords) AS kw 
        WHERE LOWER(unaccent(kw)) LIKE '%' || normalized_query || '%' ESCAPE '\'
      ) THEN 0.6
      WHEN LOWER(unaccent(COALESCE(a.categoria, ''))) LIKE '%' || normalized_query || '%' ESCAPE '\' THEN 0.4
      ELSE 0.2
    END::REAL AS similarity_score
  FROM alimentos_v2 a
  WHERE a.ativo = true
    AND (
      normalized_query IS NULL
      OR LOWER(unaccent(a.nome)) LIKE '%' || normalized_query || '%' ESCAPE '\'
      OR LOWER(unaccent(COALESCE(a.categoria, ''))) LIKE '%' || normalized_query || '%' ESCAPE '\'
      OR LOWER(unaccent(COALESCE(a.subcategoria, ''))) LIKE '%' || normalized_query || '%' ESCAPE '\'
      OR (a.keywords IS NOT NULL AND EXISTS (
        SELECT 1 FROM unnest(a.keywords) AS kw 
        WHERE LOWER(unaccent(kw)) LIKE '%' || normalized_query || '%' ESCAPE '\'
      ))
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