
-- Padronizar valores de meal_time para o padrão brasileiro
UPDATE public.foods 
SET meal_time = ARRAY['cafe_da_manha'] 
WHERE 'breakfast' = ANY(meal_time);

UPDATE public.foods 
SET meal_time = ARRAY['lanche_manha'] 
WHERE 'morning_snack' = ANY(meal_time);

UPDATE public.foods 
SET meal_time = ARRAY['almoco'] 
WHERE 'lunch' = ANY(meal_time);

UPDATE public.foods 
SET meal_time = ARRAY['lanche_tarde'] 
WHERE 'afternoon_snack' = ANY(meal_time);

UPDATE public.foods 
SET meal_time = ARRAY['jantar'] 
WHERE 'dinner' = ANY(meal_time);

UPDATE public.foods 
SET meal_time = ARRAY['ceia'] 
WHERE 'evening_snack' = ANY(meal_time);

-- Criar tabela para regras culturais de refeições
CREATE TABLE public.meal_cultural_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_type TEXT NOT NULL,
  food_category TEXT NOT NULL,
  cultural_score INTEGER NOT NULL DEFAULT 5, -- 1-10 (1=inadequado, 10=muito adequado)
  is_forbidden BOOLEAN NOT NULL DEFAULT false,
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir regras culturais brasileiras básicas
INSERT INTO public.meal_cultural_rules (meal_type, food_category, cultural_score, is_forbidden, reasoning) VALUES
-- Café da manhã - adequados
('cafe_da_manha', 'Cereais e derivados', 9, false, 'Pães, cereais e aveia são muito comuns no café brasileiro'),
('cafe_da_manha', 'Laticínios', 9, false, 'Leite, queijo e iogurte são básicos no café brasileiro'),
('cafe_da_manha', 'Frutas', 8, false, 'Frutas são saudáveis e comuns no café da manhã'),
('cafe_da_manha', 'Pães e biscoitos', 10, false, 'Pão é essencial no café da manhã brasileiro'),

-- Café da manhã - inadequados
('cafe_da_manha', 'Carnes', 2, true, 'Carnes pesadas não são culturalmente apropriadas no café brasileiro'),
('cafe_da_manha', 'Leguminosas', 1, true, 'Feijão no café da manhã não é costume brasileiro'),
('cafe_da_manha', 'Pratos prontos', 3, false, 'Pratos elaborados são raros no café da manhã'),

-- Almoço - adequados
('almoco', 'Carnes', 10, false, 'Carnes são essenciais no almoço brasileiro'),
('almoco', 'Cereais e derivados', 9, false, 'Arroz é base do almoço brasileiro'),
('almoco', 'Leguminosas', 10, false, 'Feijão é fundamental no almoço brasileiro'),
('almoco', 'Hortaliças', 8, false, 'Verduras e legumes completam o almoço'),
('almoco', 'Óleos e gorduras', 7, false, 'Temperos e óleos são importantes no preparo'),

-- Almoço - menos adequados
('almoco', 'Frutas', 6, false, 'Frutas são mais comuns como sobremesa'),
('almoco', 'Pães e biscoitos', 4, false, 'Pães não são comuns no almoço principal'),

-- Jantar - adequados
('jantar', 'Carnes', 8, false, 'Carnes são comuns no jantar, mas mais leves'),
('jantar', 'Cereais e derivados', 7, false, 'Arroz pode ser consumido no jantar'),
('jantar', 'Hortaliças', 9, false, 'Verduras são muito adequadas no jantar'),
('jantar', 'Laticínios', 6, false, 'Queijos leves são aceitáveis'),

-- Lanches - adequados
('lanche_manha', 'Frutas', 10, false, 'Frutas são ideais para lanches'),
('lanche_manha', 'Laticínios', 8, false, 'Iogurtes são ótimos para lanches'),
('lanche_manha', 'Oleaginosas', 9, false, 'Castanhas são lanches saudáveis'),

('lanche_tarde', 'Frutas', 9, false, 'Frutas são perfeitas para lanche da tarde'),
('lanche_tarde', 'Pães e biscoitos', 7, false, 'Biscoitos são comuns no lanche'),
('lanche_tarde', 'Laticínios', 8, false, 'Queijos e iogurtes são adequados'),

-- Ceia - adequados
('ceia', 'Laticínios', 9, false, 'Leite e derivados são ideais para ceia'),
('ceia', 'Frutas', 8, false, 'Frutas leves são boas para ceia'),
('ceia', 'Cereais e derivados', 6, false, 'Cereais leves podem ser consumidos');

-- Habilitar RLS na nova tabela
ALTER TABLE public.meal_cultural_rules ENABLE ROW LEVEL SECURITY;

-- Criar política para leitura pública das regras culturais
CREATE POLICY "Anyone can read cultural rules" ON public.meal_cultural_rules
  FOR SELECT USING (true);

-- Atualizar função generate_meal_plan para considerar regras culturais
CREATE OR REPLACE FUNCTION public.generate_meal_plan_with_cultural_rules(
  p_user_id uuid,
  p_patient_id uuid,
  p_target_calories numeric,
  p_target_protein numeric,
  p_target_carbs numeric,
  p_target_fats numeric,
  p_date text DEFAULT NULL::text
) RETURNS uuid
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

        -- Get culturally appropriate foods for this meal type
        SELECT ARRAY_AGG(f.id) INTO v_culturally_appropriate_foods
        FROM public.foods f
        INNER JOIN public.meal_cultural_rules mcr ON f.food_group = mcr.food_category
        WHERE mcr.meal_type = v_meal_type
          AND mcr.is_forbidden = false
          AND mcr.cultural_score >= 6
          AND (v_meal_type = ANY(f.meal_time) OR 'any' = ANY(f.meal_time))
        ORDER BY mcr.cultural_score DESC, RANDOM()
        LIMIT 3;

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
$function$;
