-- SPRINT R2: Foreign Keys e Limpeza de Tabelas Duplicadas
-- ============================================================

-- 1. ADICIONAR FOREIGN KEYS CRÍTICOS
-- ============================================================

-- FK: meal_plan_items.food_id → alimentos_v2.id
-- Remove FK antiga se existir e adiciona nova
ALTER TABLE meal_plan_items 
  DROP CONSTRAINT IF EXISTS meal_plan_items_food_id_fkey;

ALTER TABLE meal_plan_items
  ADD CONSTRAINT meal_plan_items_food_id_fkey 
  FOREIGN KEY (food_id) 
  REFERENCES alimentos_v2(id) 
  ON DELETE SET NULL;

-- FK: food_usage_history.alimento_id → alimentos_v2.id
-- Remove FK antiga se existir e adiciona nova
ALTER TABLE food_usage_history 
  DROP CONSTRAINT IF EXISTS food_usage_history_alimento_id_fkey;

ALTER TABLE food_usage_history
  ADD CONSTRAINT food_usage_history_alimento_id_fkey 
  FOREIGN KEY (alimento_id) 
  REFERENCES alimentos_v2(id) 
  ON DELETE CASCADE;

-- Criar tabela user_favorite_foods se não existir
CREATE TABLE IF NOT EXISTS user_favorite_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alimento_id UUID NOT NULL REFERENCES alimentos_v2(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, alimento_id)
);

-- RLS para user_favorite_foods
ALTER TABLE user_favorite_foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own favorite foods" ON user_favorite_foods;
CREATE POLICY "Users can manage their own favorite foods"
  ON user_favorite_foods
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_favorite_foods_user_id ON user_favorite_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_foods_alimento_id ON user_favorite_foods(alimento_id);

-- 2. DELETAR TABELAS DUPLICADAS EM PORTUGUÊS
-- ============================================================
-- ATENÇÃO: Estas tabelas são duplicatas do sistema novo
-- O sistema agora usa: meal_plans, meal_plan_items, alimentos_v2

-- Deletar itens_refeicao (duplicata de meal_plan_items)
DROP TABLE IF EXISTS itens_refeicao CASCADE;

-- Deletar refeicoes_distribuicao (duplicata de meal structure)
DROP TABLE IF EXISTS refeicoes_distribuicao CASCADE;

-- Deletar plano_nutricional_diario (duplicata de meal_plans)
DROP TABLE IF EXISTS plano_nutricional_diario CASCADE;

-- 3. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================
COMMENT ON TABLE alimentos_v2 IS 'Tabela unificada de alimentos brasileiros (TACO + complementos). Substitui foods/foods_legacy.';
COMMENT ON TABLE meal_plan_items IS 'Itens de refeição vinculados a alimentos_v2. Substitui itens_refeicao.';
COMMENT ON TABLE meal_plans IS 'Planos alimentares diários. Substitui plano_nutricional_diario.';
COMMENT ON TABLE food_usage_history IS 'Histórico de uso de alimentos por nutricionista para sugestões inteligentes.';
COMMENT ON TABLE user_favorite_foods IS 'Alimentos favoritos marcados pelo usuário para acesso rápido.';