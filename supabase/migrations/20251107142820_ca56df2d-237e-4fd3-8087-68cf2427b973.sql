-- Corrigir warnings de segurança: adicionar search_path às funções criadas

-- 1. Recriar função create_meal_plan_version_snapshot com search_path
CREATE OR REPLACE FUNCTION create_meal_plan_version_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

-- 2. Recriar função restore_meal_plan_version com search_path
CREATE OR REPLACE FUNCTION restore_meal_plan_version(
  p_meal_plan_id UUID,
  p_version_number INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
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
    meals = (v_snapshot->>'meals')::JSONB,
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
$$;