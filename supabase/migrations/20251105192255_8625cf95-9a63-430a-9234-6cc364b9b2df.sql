-- Sprint 1: Add enhanced fields to alimentos_v2 for better search and UX
-- Fix: Enable pg_trgm extension FIRST before creating indexes

-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add new columns to alimentos_v2
ALTER TABLE alimentos_v2 
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipo_refeicao_sugerida TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS popularidade INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS descricao_curta TEXT,
ADD COLUMN IF NOT EXISTS preparo_sugerido TEXT;

-- Create indexes for better search performance (NOW with pg_trgm enabled)
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_keywords ON alimentos_v2 USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_tipo_refeicao ON alimentos_v2 USING GIN(tipo_refeicao_sugerida);
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_popularidade ON alimentos_v2(popularidade DESC);
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_nome_trgm ON alimentos_v2 USING gin(nome gin_trgm_ops);

-- Create user favorite foods table
CREATE TABLE IF NOT EXISTS user_favorite_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alimento_id UUID NOT NULL REFERENCES alimentos_v2(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, alimento_id)
);

ALTER TABLE user_favorite_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorite foods"
ON user_favorite_foods
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create meal templates table
CREATE TABLE IF NOT EXISTS meal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  meal_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_kcal NUMERIC NOT NULL DEFAULT 0,
  total_ptn_g NUMERIC NOT NULL DEFAULT 0,
  total_cho_g NUMERIC NOT NULL DEFAULT 0,
  total_lip_g NUMERIC NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates"
ON meal_templates
FOR ALL
USING (user_id = auth.uid() OR is_public = true)
WITH CHECK (user_id = auth.uid());

-- Create food usage history
CREATE TABLE IF NOT EXISTS food_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alimento_id UUID NOT NULL REFERENCES alimentos_v2(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_usage_history_user ON food_usage_history(user_id, used_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_usage_history_alimento ON food_usage_history(alimento_id);

ALTER TABLE food_usage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own food usage history"
ON food_usage_history
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to get user's most used foods
CREATE OR REPLACE FUNCTION get_user_most_used_foods(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  nome TEXT,
  categoria TEXT,
  kcal_por_referencia NUMERIC,
  ptn_g_por_referencia NUMERIC,
  cho_g_por_referencia NUMERIC,
  lip_g_por_referencia NUMERIC,
  medida_padrao_referencia TEXT,
  peso_referencia_g NUMERIC,
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
    a.kcal_por_referencia,
    a.ptn_g_por_referencia,
    a.cho_g_por_referencia,
    a.lip_g_por_referencia,
    a.medida_padrao_referencia,
    a.peso_referencia_g,
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