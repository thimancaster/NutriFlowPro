-- FASE 5: Otimização SQL - Eliminar problema N+1 em generate_meal_plan
-- Refatorar função para buscar todos os alimentos de uma vez ANTES do loop

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
    v_foods_data JSONB; -- NOVO: armazena todos os dados dos alimentos
    v_food_id UUID;
    v_food_data JSONB; -- NOVO: dados de um alimento específico
    v_food_name TEXT;
    v_food_portion NUMERIC;
    v_food_unit TEXT;
    v_food_calories NUMERIC;
    v_food_protein NUMERIC;
    v_food_carbs NUMERIC;
    v_food_fats NUMERIC;
    v_peso_ref NUMERIC;
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

        -- OTIMIZAÇÃO: Buscar TODOS os alimentos de uma vez ANTES do loop
        IF v_sample_foods IS NOT NULL AND array_length(v_sample_foods, 1) > 0 THEN
            SELECT jsonb_object_agg(id::text, row_to_json(a))
            INTO v_foods_data
            FROM public.alimentos_v2 a
            WHERE a.id = ANY(v_sample_foods);

            -- Create meal items usando os dados pre-carregados
            FOR j IN 1..LEAST(array_length(v_sample_foods, 1), 3) LOOP
                v_food_id := v_sample_foods[j];
                v_food_data := v_foods_data->v_food_id::text;
                
                -- Extrair dados do JSONB (sem query adicional)
                v_food_name := v_food_data->>'nome';
                v_food_portion := (v_food_data->>'peso_referencia_g')::NUMERIC;
                v_food_unit := v_food_data->>'medida_padrao_referencia';
                v_food_calories := (v_food_data->>'kcal_por_referencia')::NUMERIC;
                v_food_protein := (v_food_data->>'ptn_g_por_referencia')::NUMERIC;
                v_food_carbs := (v_food_data->>'cho_g_por_referencia')::NUMERIC;
                v_food_fats := (v_food_data->>'lip_g_por_referencia')::NUMERIC;
                v_peso_ref := (v_food_data->>'peso_referencia_g')::NUMERIC;

                -- Calculate portion
                v_food_portion := CASE 
                    WHEN v_food_calories > 0 THEN 
                        ROUND((v_meal_calories / array_length(v_sample_foods, 1)) / v_food_calories * v_food_portion, 1)
                    ELSE v_food_portion
                END;

                -- Recalculate nutritional values
                v_meal_calories := ROUND(v_food_calories * (v_food_portion / v_peso_ref));
                v_meal_protein := ROUND(v_food_protein * (v_food_portion / v_peso_ref), 1);
                v_meal_carbs := ROUND(v_food_carbs * (v_food_portion / v_peso_ref), 1);
                v_meal_fats := ROUND(v_food_fats * (v_food_portion / v_peso_ref), 1);

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

-- FASE 6: RLS para alimentos_v2
-- Remover policy insegura e criar policies corretas

DROP POLICY IF EXISTS "Anyone can read foods v2" ON alimentos_v2;

-- SELECT: Apenas usuários autenticados
CREATE POLICY "Authenticated users can read active foods v2" 
ON alimentos_v2 FOR SELECT 
USING (ativo = true AND auth.uid() IS NOT NULL);

-- INSERT/UPDATE/DELETE: Apenas admins
CREATE POLICY "Admins can manage foods v2" 
ON alimentos_v2 FOR ALL 
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- FASE 6b: RLS para patient_evolution_metrics (se ainda não existe)
ALTER TABLE patient_evolution_metrics ENABLE ROW LEVEL SECURITY;

-- SELECT/INSERT/UPDATE: Apenas o proprietário
DROP POLICY IF EXISTS "Users can manage their patient evolution metrics" ON patient_evolution_metrics;

CREATE POLICY "Users can view own patient evolution metrics" 
ON patient_evolution_metrics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own patient evolution metrics" 
ON patient_evolution_metrics FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own patient evolution metrics" 
ON patient_evolution_metrics FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());