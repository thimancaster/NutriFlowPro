-- SPRINT R1: Migração foods → alimentos_v2 + Seed TACO
-- Fase 1: Migrar 3,481 alimentos existentes

-- Inserir dados de foods em alimentos_v2 com transformação de schema
INSERT INTO alimentos_v2 (
  id,
  nome,
  categoria,
  peso_referencia_g,
  medida_padrao_referencia,
  kcal_por_referencia,
  ptn_g_por_referencia,
  cho_g_por_referencia,
  lip_g_por_referencia,
  fibra_g_por_referencia,
  sodio_mg_por_referencia,
  tipo_refeicao_sugerida,
  subcategoria,
  popularidade,
  keywords,
  ativo,
  fonte,
  created_at
)
SELECT 
  f.id,
  f.name as nome,
  CASE 
    WHEN f.food_group = 'grains' THEN 'Cereais e Derivados'
    WHEN f.food_group = 'proteins' THEN 'Carnes e Ovos'
    WHEN f.food_group = 'vegetables' THEN 'Verduras e Legumes'
    WHEN f.food_group = 'fruits' THEN 'Frutas'
    WHEN f.food_group = 'dairy' THEN 'Leites e Derivados'
    WHEN f.food_group = 'fats' THEN 'Óleos e Gorduras'
    WHEN f.food_group = 'legumes' THEN 'Leguminosas'
    ELSE 'Outros'
  END as categoria,
  100 as peso_referencia_g,
  CASE 
    WHEN f.portion_unit = 'g' THEN f.portion_size::text || 'g'
    WHEN f.portion_unit = 'ml' THEN f.portion_size::text || 'ml'
    WHEN f.portion_unit = 'unit' THEN '1 unidade'
    WHEN f.portion_unit = 'cup' THEN '1 xícara'
    WHEN f.portion_unit = 'tbsp' THEN '1 colher sopa'
    WHEN f.portion_unit = 'tsp' THEN '1 colher chá'
    ELSE '100g'
  END as medida_padrao_referencia,
  (f.calories * 100 / f.portion_size) as kcal_por_referencia,
  (f.protein * 100 / f.portion_size) as ptn_g_por_referencia,
  (f.carbs * 100 / f.portion_size) as cho_g_por_referencia,
  (f.fats * 100 / f.portion_size) as lip_g_por_referencia,
  (COALESCE(f.fiber, 0) * 100 / f.portion_size) as fibra_g_por_referencia,
  (COALESCE(f.sodium, 0) * 100 / f.portion_size) as sodio_mg_por_referencia,
  COALESCE(f.meal_time, ARRAY['Todas']::text[]) as tipo_refeicao_sugerida,
  f.category as subcategoria,
  COALESCE(f.sustainability_score, 5) as popularidade,
  string_to_array(lower(f.name), ' ') as keywords,
  true as ativo,
  'legacy_migration' as fonte,
  f.created_at
FROM foods f
WHERE NOT EXISTS (
  SELECT 1 FROM alimentos_v2 a WHERE a.id = f.id
);

-- Fase 2: Renomear tabela foods para foods_legacy
ALTER TABLE foods RENAME TO foods_legacy;

-- Fase 3: Atualizar RLS policy da tabela legacy (somente leitura)
ALTER TABLE foods_legacy ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read foods" ON foods_legacy;
DROP POLICY IF EXISTS "Authenticated users can read foods" ON foods_legacy;

CREATE POLICY "Anyone can read legacy foods (read-only)" 
ON foods_legacy FOR SELECT 
USING (true);

-- Fase 4: Adicionar índices para performance em alimentos_v2
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_nome_trgm ON alimentos_v2 USING gin (nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_categoria ON alimentos_v2(categoria);
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_keywords ON alimentos_v2 USING gin (keywords);
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_ativo ON alimentos_v2(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_popularidade ON alimentos_v2(popularidade DESC);

-- Comentário informativo
COMMENT ON TABLE foods_legacy IS 'Tabela legado - NÃO USAR. Dados migrados para alimentos_v2. Mantida apenas para backup e referência histórica.';
COMMENT ON TABLE alimentos_v2 IS 'Tabela principal de alimentos. Contém dados migrados da tabela foods_legacy + alimentos TACO brasileiros.';