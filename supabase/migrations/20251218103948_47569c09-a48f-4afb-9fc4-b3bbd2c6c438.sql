-- Enable pg_trgm extension for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index for efficient full-text search on alimentos_v2
CREATE INDEX IF NOT EXISTS idx_alimentos_nome_trgm 
ON alimentos_v2 USING GIN (nome gin_trgm_ops);

-- Create additional indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_alimentos_categoria_trgm 
ON alimentos_v2 USING GIN (categoria gin_trgm_ops);

-- Create index for popularity ordering
CREATE INDEX IF NOT EXISTS idx_alimentos_popularidade 
ON alimentos_v2 (popularidade DESC NULLS LAST) WHERE ativo = true;

-- Create composite index for common search patterns
CREATE INDEX IF NOT EXISTS idx_alimentos_ativo_categoria 
ON alimentos_v2 (ativo, categoria);

-- Create function for fuzzy search using pg_trgm similarity
CREATE OR REPLACE FUNCTION search_alimentos_fulltext(
  search_query TEXT,
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    GREATEST(
      similarity(LOWER(a.nome), LOWER(search_query)),
      similarity(LOWER(COALESCE(a.categoria, '')), LOWER(search_query)) * 0.5
    ) AS similarity_score
  FROM alimentos_v2 a
  WHERE 
    a.ativo = true
    AND (
      search_query IS NULL 
      OR search_query = ''
      OR a.nome ILIKE '%' || search_query || '%'
      OR a.categoria ILIKE '%' || search_query || '%'
      OR a.subcategoria ILIKE '%' || search_query || '%'
      OR similarity(LOWER(a.nome), LOWER(search_query)) > 0.2
    )
    AND (search_category IS NULL OR a.categoria = search_category)
    AND (search_meal_type IS NULL OR search_meal_type = ANY(a.tipo_refeicao_sugerida))
  ORDER BY 
    CASE 
      WHEN LOWER(a.nome) = LOWER(search_query) THEN 0
      WHEN LOWER(a.nome) LIKE LOWER(search_query) || '%' THEN 1
      WHEN LOWER(a.nome) LIKE '%' || LOWER(search_query) || '%' THEN 2
      ELSE 3
    END,
    similarity(LOWER(a.nome), LOWER(search_query)) DESC,
    COALESCE(a.popularidade, 0) DESC,
    a.nome ASC
  LIMIT max_results;
END;
$$;