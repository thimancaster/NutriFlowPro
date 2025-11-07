-- FASE 4: PERSISTÊNCIA E VERSIONAMENTO
-- Adicionar campos de versionamento à tabela meal_plans

-- 1. Adicionar campos de versionamento
ALTER TABLE meal_plans
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_version_id UUID REFERENCES meal_plans(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Criar tabela de histórico de versões (cópia completa do plano)
CREATE TABLE IF NOT EXISTS meal_plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL, -- Snapshot completo do plano
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_summary TEXT,
  UNIQUE(meal_plan_id, version_number)
);

-- 3. Criar tabela de histórico de mudanças (alterações específicas)
CREATE TABLE IF NOT EXISTS meal_plan_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  version_from INTEGER NOT NULL,
  version_to INTEGER NOT NULL,
  change_type TEXT NOT NULL, -- 'item_added', 'item_removed', 'item_updated', 'meal_added', 'meal_removed', etc.
  change_data JSONB NOT NULL, -- Detalhes da mudança
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_meal_plan_versions_meal_plan_id ON meal_plan_versions(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_versions_version ON meal_plan_versions(meal_plan_id, version_number);
CREATE INDEX IF NOT EXISTS idx_meal_plan_changes_meal_plan_id ON meal_plan_changes(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_patient_active ON meal_plans(patient_id, is_active);

-- 5. RLS Policies para meal_plan_versions
ALTER TABLE meal_plan_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their meal plans"
ON meal_plan_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM meal_plans 
    WHERE meal_plans.id = meal_plan_versions.meal_plan_id 
    AND meal_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create versions of their meal plans"
ON meal_plan_versions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM meal_plans 
    WHERE meal_plans.id = meal_plan_versions.meal_plan_id 
    AND meal_plans.user_id = auth.uid()
  )
);

-- 6. RLS Policies para meal_plan_changes
ALTER TABLE meal_plan_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view changes of their meal plans"
ON meal_plan_changes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM meal_plans 
    WHERE meal_plans.id = meal_plan_changes.meal_plan_id 
    AND meal_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create changes for their meal plans"
ON meal_plan_changes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM meal_plans 
    WHERE meal_plans.id = meal_plan_changes.meal_plan_id 
    AND meal_plans.user_id = auth.uid()
  )
);

-- 7. Função para criar snapshot automático antes de updates
CREATE OR REPLACE FUNCTION create_meal_plan_version_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Só cria snapshot se houve mudança real nos dados
  IF (OLD.meals IS DISTINCT FROM NEW.meals OR 
      OLD.total_calories IS DISTINCT FROM NEW.total_calories OR
      OLD.total_protein IS DISTINCT FROM NEW.total_protein OR
      OLD.total_carbs IS DISTINCT FROM NEW.total_carbs OR
      OLD.total_fats IS DISTINCT FROM NEW.total_fats) THEN
    
    -- Incrementa versão
    NEW.version := COALESCE(OLD.version, 1) + 1;
    
    -- Cria snapshot da versão anterior
    INSERT INTO meal_plan_versions (
      meal_plan_id,
      version_number,
      snapshot_data,
      created_by,
      change_summary
    ) VALUES (
      OLD.id,
      OLD.version,
      jsonb_build_object(
        'id', OLD.id,
        'patient_id', OLD.patient_id,
        'date', OLD.date,
        'meals', OLD.meals,
        'total_calories', OLD.total_calories,
        'total_protein', OLD.total_protein,
        'total_carbs', OLD.total_carbs,
        'total_fats', OLD.total_fats,
        'notes', OLD.notes,
        'created_at', OLD.created_at,
        'updated_at', OLD.updated_at
      ),
      auth.uid(),
      'Auto-snapshot before update'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para criar snapshots automáticos
DROP TRIGGER IF EXISTS trigger_create_meal_plan_version ON meal_plans;
CREATE TRIGGER trigger_create_meal_plan_version
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION create_meal_plan_version_snapshot();

-- 9. Função para restaurar uma versão específica
CREATE OR REPLACE FUNCTION restore_meal_plan_version(
  p_meal_plan_id UUID,
  p_version_number INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_snapshot JSONB;
BEGIN
  -- Busca o snapshot da versão
  SELECT snapshot_data INTO v_snapshot
  FROM meal_plan_versions
  WHERE meal_plan_id = p_meal_plan_id
    AND version_number = p_version_number;
  
  IF v_snapshot IS NULL THEN
    RAISE EXCEPTION 'Version % not found for meal plan %', p_version_number, p_meal_plan_id;
  END IF;
  
  -- Restaura os dados
  UPDATE meal_plans
  SET
    meals = v_snapshot->>'meals',
    total_calories = (v_snapshot->>'total_calories')::NUMERIC,
    total_protein = (v_snapshot->>'total_protein')::NUMERIC,
    total_carbs = (v_snapshot->>'total_carbs')::NUMERIC,
    total_fats = (v_snapshot->>'total_fats')::NUMERIC,
    notes = v_snapshot->>'notes',
    updated_at = NOW()
  WHERE id = p_meal_plan_id;
  
  -- Registra a restauração
  INSERT INTO meal_plan_changes (
    meal_plan_id,
    version_from,
    version_to,
    change_type,
    change_data,
    changed_by
  ) VALUES (
    p_meal_plan_id,
    (SELECT version FROM meal_plans WHERE id = p_meal_plan_id),
    p_version_number,
    'version_restored',
    jsonb_build_object('restored_version', p_version_number),
    auth.uid()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE meal_plan_versions IS 'Armazena snapshots completos de cada versão do plano alimentar';
COMMENT ON TABLE meal_plan_changes IS 'Rastreia mudanças específicas entre versões do plano alimentar';
COMMENT ON FUNCTION restore_meal_plan_version IS 'Restaura um plano alimentar para uma versão específica';