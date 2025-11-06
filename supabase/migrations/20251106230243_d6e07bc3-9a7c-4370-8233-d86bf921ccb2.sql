-- SPRINT R3: Atualizar Funções SQL para alimentos_v2
-- ============================================================

-- 1. ATUALIZAR search_foods_secure
-- ============================================================
CREATE OR REPLACE FUNCTION public.search_foods_secure(
  search_query text, 
  search_category text DEFAULT NULL::text, 
  search_limit integer DEFAULT 20
)
RETURNS TABLE(
  id uuid, 
  name text, 
  category text, 
  calories_per_100g numeric, 
  protein_per_100g numeric, 
  carbs_per_100g numeric, 
  fat_per_100g numeric, 
  portion_size numeric, 
  portion_unit text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Validar parâmetros de entrada
  IF LENGTH(search_query) < 2 OR LENGTH(search_query) > 100 THEN
    RAISE EXCEPTION 'Query de busca deve ter entre 2 e 100 caracteres';
  END IF;
  
  search_limit := LEAST(GREATEST(search_limit, 1), 100);
  
  -- Log da busca para auditoria
  PERFORM public.log_security_event_safe(
    auth.uid(),
    'food_search',
    jsonb_build_object(
      'query', search_query,
      'category', search_category,
      'limit', search_limit
    )
  );
  
  -- Busca parametrizada segura usando alimentos_v2
  RETURN QUERY
  SELECT 
    a.id,
    a.nome as name,
    a.categoria as category,
    a.kcal_por_referencia as calories_per_100g,
    a.ptn_g_por_referencia as protein_per_100g,
    a.cho_g_por_referencia as carbs_per_100g,
    a.lip_g_por_referencia as fat_per_100g,
    a.peso_referencia_g as portion_size,
    a.medida_padrao_referencia as portion_unit
  FROM public.alimentos_v2 a
  WHERE a.ativo = true
    AND a.nome ILIKE '%' || search_query || '%'
    AND (search_category IS NULL OR a.categoria = search_category)
  ORDER BY a.nome
  LIMIT search_limit;
END;
$function$;

-- 2. ATUALIZAR get_user_most_used_foods
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_most_used_foods(
  p_user_id uuid, 
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  nome text,
  categoria text,
  subcategoria text,
  kcal_por_referencia numeric,
  ptn_g_por_referencia numeric,
  cho_g_por_referencia numeric,
  lip_g_por_referencia numeric,
  fibra_g_por_referencia numeric,
  sodio_mg_por_referencia numeric,
  medida_padrao_referencia text,
  peso_referencia_g numeric,
  keywords text[],
  tipo_refeicao_sugerida text[],
  popularidade integer,
  descricao_curta text,
  preparo_sugerido text,
  usage_count bigint,
  is_favorite boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
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
    a.medida_padrao_referencia,
    a.peso_referencia_g,
    a.keywords,
    a.tipo_refeicao_sugerida,
    a.popularidade,
    a.descricao_curta,
    a.preparo_sugerido,
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
$function$;

-- 3. ATUALIZAR generate_meal_plan
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_meal_plan(
  p_user_id uuid, 
  p_patient_id uuid, 
  p_target_calories numeric, 
  p_target_protein numeric, 
  p_target_carbs numeric, 
  p_target_fats numeric, 
  p_date text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_meal_plan_id UUID;
    v_date DATE;
    v_meal_types TEXT[] := ARRAY['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'];
    v_meal_names TEXT[] := ARRAY['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];
    v_meal_distributions NUMERIC[] := ARRAY[0.25, 0.10, 0.30, 0.10, 0.20, 0.05];
    v_meal_type TEXT;
    v_meal_name TEXT;
    v_meal_distribution NUMERIC;
    v_meal_calories NUMERIC;
    v_meal_protein NUMERIC;
    v_meal_carbs NUMERIC;
    v_meal_fats NUMERIC;
    v_sample_foods UUID[];
    v_food_id UUID;
    v_food_name TEXT;
    v_food_portion NUMERIC;
    v_food_unit TEXT;
    v_food_calories NUMERIC;
    v_food_protein NUMERIC;
    v_food_carbs NUMERIC;
    v_food_fats NUMERIC;
    v_meals_json JSONB := '[]'::jsonb;
    v_meal_json JSONB;
    v_foods_array JSONB := '[]'::jsonb;
    v_food_json JSONB;
BEGIN
    -- Set date
    IF p_date IS NULL THEN
        v_date := CURRENT_DATE;
    ELSE
        v_date := p_date::DATE;
    END IF;

    v_meal_plan_id := gen_random_uuid();

    -- Create meal plan record
    INSERT INTO public.meal_plans (
        id, user_id, patient_id, date, meals, total_calories, total_protein, 
        total_carbs, total_fats, day_of_week, created_at, updated_at
    ) VALUES (
        v_meal_plan_id, p_user_id, p_patient_id, v_date, '[]'::jsonb,
        p_target_calories, p_target_protein, p_target_carbs, p_target_fats,
        EXTRACT(DOW FROM v_date)::INTEGER, NOW(), NOW()
    );

    -- Generate meals using alimentos_v2
    FOR i IN 1..array_length(v_meal_types, 1) LOOP
        v_meal_type := v_meal_types[i];
        v_meal_name := v_meal_names[i];
        v_meal_distribution := v_meal_distributions[i];
        
        v_meal_calories := ROUND(p_target_calories * v_meal_distribution);
        v_meal_protein := ROUND(p_target_protein * v_meal_distribution);
        v_meal_carbs := ROUND(p_target_carbs * v_meal_distribution);
        v_meal_fats := ROUND(p_target_fats * v_meal_distribution);

        v_foods_array := '[]'::jsonb;

        -- Get sample foods from alimentos_v2
        SELECT ARRAY_AGG(id) INTO v_sample_foods
        FROM (
            SELECT id 
            FROM public.alimentos_v2
            WHERE ativo = true
              AND (v_meal_type = ANY(tipo_refeicao_sugerida) OR 'any' = ANY(tipo_refeicao_sugerida))
            ORDER BY RANDOM()
            LIMIT 3
        ) sample_foods;

        -- Fallback to general foods
        IF v_sample_foods IS NULL OR array_length(v_sample_foods, 1) = 0 THEN
            SELECT ARRAY_AGG(id) INTO v_sample_foods
            FROM (
                SELECT id 
                FROM public.alimentos_v2
                WHERE ativo = true
                ORDER BY RANDOM()
                LIMIT 3
            ) sample_foods;
        END IF;

        -- Create meal items
        IF v_sample_foods IS NOT NULL AND array_length(v_sample_foods, 1) > 0 THEN
            FOR j IN 1..LEAST(array_length(v_sample_foods, 1), 3) LOOP
                v_food_id := v_sample_foods[j];
                
                -- Get food details from alimentos_v2
                SELECT 
                  nome, 
                  peso_referencia_g, 
                  medida_padrao_referencia, 
                  kcal_por_referencia, 
                  ptn_g_por_referencia, 
                  cho_g_por_referencia, 
                  lip_g_por_referencia
                INTO 
                  v_food_name, 
                  v_food_portion, 
                  v_food_unit, 
                  v_food_calories, 
                  v_food_protein, 
                  v_food_carbs, 
                  v_food_fats
                FROM public.alimentos_v2
                WHERE id = v_food_id;

                -- Calculate portion
                v_food_portion := CASE 
                    WHEN v_food_calories > 0 THEN 
                        ROUND((v_meal_calories / array_length(v_sample_foods, 1)) / v_food_calories * v_food_portion, 1)
                    ELSE v_food_portion
                END;

                -- Recalculate nutritional values
                v_meal_calories := ROUND(v_food_calories * (v_food_portion / (SELECT peso_referencia_g FROM public.alimentos_v2 WHERE id = v_food_id)));
                v_meal_protein := ROUND(v_food_protein * (v_food_portion / (SELECT peso_referencia_g FROM public.alimentos_v2 WHERE id = v_food_id)), 1);
                v_meal_carbs := ROUND(v_food_carbs * (v_food_portion / (SELECT peso_referencia_g FROM public.alimentos_v2 WHERE id = v_food_id)), 1);
                v_meal_fats := ROUND(v_food_fats * (v_food_portion / (SELECT peso_referencia_g FROM public.alimentos_v2 WHERE id = v_food_id)), 1);

                -- Insert meal plan item
                INSERT INTO public.meal_plan_items (
                    id, meal_plan_id, meal_type, food_id, food_name, quantity, unit,
                    calories, protein, carbs, fats, order_index, created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), v_meal_plan_id, v_meal_type, v_food_id, v_food_name,
                    v_food_portion, v_food_unit, v_meal_calories, v_meal_protein, v_meal_carbs, v_meal_fats,
                    j, NOW(), NOW()
                );

                -- Add to JSON
                v_food_json := jsonb_build_object(
                    'id', gen_random_uuid(), 'food_id', v_food_id, 'name', v_food_name,
                    'quantity', v_food_portion, 'unit', v_food_unit, 'calories', v_meal_calories,
                    'protein', v_meal_protein, 'carbs', v_meal_carbs, 'fats', v_meal_fats, 'order_index', j
                );
                
                v_foods_array := v_foods_array || v_food_json;
            END LOOP;
        END IF;

        -- Build meal JSON
        v_meal_json := jsonb_build_object(
            'id', v_meal_type || '-meal', 'type', v_meal_type, 'name', v_meal_name,
            'foods', v_foods_array, 'total_calories', v_meal_calories,
            'total_protein', v_meal_protein, 'total_carbs', v_meal_carbs, 'total_fats', v_meal_fats
        );

        v_meals_json := v_meals_json || v_meal_json;
    END LOOP;

    -- Update meal plan with meals JSON
    UPDATE public.meal_plans 
    SET meals = v_meals_json, updated_at = NOW()
    WHERE id = v_meal_plan_id;

    RETURN v_meal_plan_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error generating meal plan: %', SQLERRM;
END;
$function$;