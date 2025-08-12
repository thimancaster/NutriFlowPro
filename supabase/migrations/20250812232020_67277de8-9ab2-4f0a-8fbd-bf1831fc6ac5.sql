
-- Migrate existing English meal types to Portuguese
UPDATE public.meal_plan_items 
SET meal_type = CASE meal_type 
  WHEN 'breakfast' THEN 'cafe_da_manha'
  WHEN 'morning_snack' THEN 'lanche_manha'
  WHEN 'lunch' THEN 'almoco'
  WHEN 'afternoon_snack' THEN 'lanche_tarde'
  WHEN 'dinner' THEN 'jantar'
  WHEN 'evening_snack' THEN 'ceia'
  ELSE meal_type -- Keep existing Portuguese values unchanged
END
WHERE meal_type IN ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack');

-- Drop the old constraint and add the new one with Portuguese meal types
ALTER TABLE public.meal_plan_items 
DROP CONSTRAINT IF EXISTS meal_plan_items_meal_type_check;

ALTER TABLE public.meal_plan_items 
ADD CONSTRAINT meal_plan_items_meal_type_check 
CHECK (meal_type = ANY (ARRAY['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia']));
