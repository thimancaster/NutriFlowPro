
-- Corrigir a função generate_meal_plan_with_cultural_rules para resolver o erro do GROUP BY
CREATE OR REPLACE FUNCTION public.generate_meal_plan_with_cultural_rules(p_user_id uuid, p_patient_id uuid, p_target_calories numeric, p_target_protein numeric, p_target_carbs numeric, p_target_fats numeric, p_date text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_meal_plan_id UUID;
    v_date DATE;
    v_meal_types TEXT[] := ARRAY['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'];
    v_meal_names TEXT[] := ARRAY['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];
    v_meal_distributions NUMERIC[] := ARRAY[0.25, 0.10, 0.30, 0.10, 0.20, 0.05];
    v_meal_type TEXT;
    v_meal_name TEXT;
    v_meal_distribution NUMERIC;
    v_meal_calories NUMERIC;
    v_meal_protein NUMERIC;
    v_meal_carbs NUMERIC;
    v_meal_fats NUMERIC;
    v_culturally_appropriate_foods UUID[];
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

    -- Generate meals with cultural intelligence
    FOR i IN 1..array_length(v_meal_types, 1) LOOP
        v_meal_type := v_meal_types[i];
        v_meal_name := v_meal_names[i];
        v_meal_distribution := v_meal_distributions[i];
        
        v_meal_calories := ROUND(p_target_calories * v_meal_distribution);
        v_meal_protein := ROUND(p_target_protein * v_meal_distribution);
        v_meal_carbs := ROUND(p_target_carbs * v_meal_distribution);
        v_meal_fats := ROUND(p_target_fats * v_meal_distribution);

        v_foods_array := '[]'::jsonb;

        -- Get culturally appropriate foods for this meal type (CORRIGIDO)
        SELECT ARRAY_AGG(food_id) INTO v_culturally_appropriate_foods
        FROM (
            SELECT DISTINCT f.id as food_id
            FROM public.foods f
            INNER JOIN public.meal_cultural_rules mcr ON f.food_group = mcr.food_category
            WHERE mcr.meal_type = v_meal_type
              AND mcr.is_forbidden = false
              AND mcr.cultural_score >= 6
              AND (v_meal_type = ANY(f.meal_time) OR 'any' = ANY(f.meal_time))
            ORDER BY mcr.cultural_score DESC, RANDOM()
            LIMIT 3
        ) ordered_foods;

        -- Fallback to general foods if no culturally appropriate ones found
        IF v_culturally_appropriate_foods IS NULL OR array_length(v_culturally_appropriate_foods, 1) = 0 THEN
            SELECT ARRAY_AGG(id) INTO v_culturally_appropriate_foods
            FROM (
                SELECT id FROM public.foods 
                WHERE v_meal_type = ANY(meal_time) OR 'any' = ANY(meal_time)
                ORDER BY RANDOM() LIMIT 3
            ) fallback_foods;
        END IF;

        -- Create meal items
        IF v_culturally_appropriate_foods IS NOT NULL AND array_length(v_culturally_appropriate_foods, 1) > 0 THEN
            FOR j IN 1..LEAST(array_length(v_culturally_appropriate_foods, 1), 3) LOOP
                v_food_id := v_culturally_appropriate_foods[j];
                
                SELECT name, portion_size, portion_unit, calories, protein, carbs, fats
                INTO v_food_name, v_food_portion, v_food_unit, v_food_calories, v_food_protein, v_food_carbs, v_food_fats
                FROM public.foods WHERE id = v_food_id;

                -- Calculate portion for meal calories
                v_food_portion := CASE 
                    WHEN v_food_calories > 0 THEN 
                        ROUND((v_meal_calories / array_length(v_culturally_appropriate_foods, 1)) / v_food_calories * v_food_portion, 1)
                    ELSE v_food_portion
                END;

                -- Recalculate nutritional values
                v_meal_calories := ROUND(v_food_calories * (v_food_portion / (SELECT portion_size FROM public.foods WHERE id = v_food_id)));
                v_meal_protein := ROUND(v_food_protein * (v_food_portion / (SELECT portion_size FROM public.foods WHERE id = v_food_id)), 1);
                v_meal_carbs := ROUND(v_food_carbs * (v_food_portion / (SELECT portion_size FROM public.foods WHERE id = v_food_id)), 1);
                v_meal_fats := ROUND(v_food_fats * (v_food_portion / (SELECT portion_size FROM public.foods WHERE id = v_food_id)), 1);

                -- Insert meal plan item
                INSERT INTO public.meal_plan_items (
                    id, meal_plan_id, meal_type, food_id, food_name, quantity, unit,
                    calories, protein, carbs, fats, order_index, created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), v_meal_plan_id, v_meal_type, v_food_id, v_food_name,
                    v_food_portion, v_food_unit, v_meal_calories, v_meal_protein, v_meal_carbs, v_meal_fats,
                    j, NOW(), NOW()
                );

                -- Add to JSON structure
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

    -- Update meal plan with complete meals JSON
    UPDATE public.meal_plans 
    SET meals = v_meals_json, updated_at = NOW()
    WHERE id = v_meal_plan_id;

    RETURN v_meal_plan_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error generating culturally intelligent meal plan: %', SQLERRM;
END;
$function$
