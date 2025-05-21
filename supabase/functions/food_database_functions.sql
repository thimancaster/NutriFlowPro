
-- This file contains SQL functions to access the food database
-- These would need to be run separately in the Supabase SQL editor

-- Function to get all food categories
CREATE OR REPLACE FUNCTION get_food_categories()
RETURNS TABLE (
  id UUID,
  name TEXT,
  color TEXT
) LANGUAGE SQL AS $$
  SELECT id, name, color FROM food_categories ORDER BY name;
$$;

-- Function to get food details by ID
CREATE OR REPLACE FUNCTION get_food_details(food_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  brand TEXT,
  description TEXT,
  category_name TEXT,
  subcategory_name TEXT,
  caloric_density TEXT,
  glycemic_index TEXT,
  source TEXT
) LANGUAGE SQL AS $$
  SELECT 
    f.id,
    f.name,
    f.brand,
    f.description,
    c.name AS category_name,
    s.name AS subcategory_name,
    f.caloric_density,
    f.glycemic_index,
    f.source
  FROM 
    foods f
    LEFT JOIN food_categories c ON f.category_id = c.id
    LEFT JOIN food_subcategories s ON f.subcategory_id = s.id
  WHERE 
    f.id = food_id;
$$;

-- Function to get food measures by food ID
CREATE OR REPLACE FUNCTION get_food_measures(food_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  quantity DECIMAL,
  unit TEXT,
  type TEXT,
  is_default BOOLEAN
) LANGUAGE SQL AS $$
  SELECT
    id,
    name,
    quantity,
    unit,
    type,
    is_default
  FROM
    food_measures
  WHERE
    food_id = get_food_measures.food_id
  ORDER BY
    is_default DESC, name;
$$;

-- Function to get nutritional values by food ID and measure ID
CREATE OR REPLACE FUNCTION get_nutritional_values(food_id UUID, measure_id UUID)
RETURNS TABLE (
  id UUID,
  measure_id UUID,
  calories DECIMAL,
  protein DECIMAL,
  fat DECIMAL,
  carbs DECIMAL,
  fiber DECIMAL,
  sugar DECIMAL,
  sodium DECIMAL,
  potassium DECIMAL,
  calcium DECIMAL,
  iron DECIMAL,
  vitamin_a DECIMAL,
  vitamin_c DECIMAL,
  vitamin_d DECIMAL,
  vitamin_e DECIMAL
) LANGUAGE SQL AS $$
  SELECT
    id,
    measure_id,
    calories,
    protein,
    fat,
    carbs,
    fiber,
    sugar,
    sodium,
    potassium,
    calcium,
    iron,
    vitamin_a,
    vitamin_c,
    vitamin_d,
    vitamin_e
  FROM
    nutritional_values
  WHERE
    food_id = get_nutritional_values.food_id
    AND measure_id = get_nutritional_values.measure_id;
$$;

-- Function to get food restrictions by food ID
CREATE OR REPLACE FUNCTION get_food_restrictions(food_id UUID)
RETURNS TABLE (
  id UUID,
  restriction_name TEXT
) LANGUAGE SQL AS $$
  SELECT
    fr.id,
    rt.name AS restriction_name
  FROM
    food_restrictions fr
    JOIN restriction_types rt ON fr.restriction_id = rt.id
  WHERE
    fr.food_id = get_food_restrictions.food_id;
$$;
