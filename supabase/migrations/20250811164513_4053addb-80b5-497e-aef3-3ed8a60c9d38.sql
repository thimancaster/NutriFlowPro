
-- Verificar a constraint atual da tabela meal_plan_items
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'meal_plan_items'::regclass 
AND contype = 'c';

-- Remover a constraint problemática se existir
ALTER TABLE meal_plan_items DROP CONSTRAINT IF EXISTS meal_plan_items_meal_type_check;

-- Adicionar a constraint correta com os valores que o sistema está usando
ALTER TABLE meal_plan_items ADD CONSTRAINT meal_plan_items_meal_type_check 
CHECK (meal_type IN (
  'cafe_da_manha', 
  'lanche_manha', 
  'almoco', 
  'lanche_tarde', 
  'jantar', 
  'ceia',
  'breakfast',
  'morning_snack', 
  'lunch', 
  'afternoon_snack', 
  'dinner', 
  'evening_snack'
));

-- Verificar se há dados inconsistentes na tabela
SELECT DISTINCT meal_type FROM meal_plan_items WHERE meal_type NOT IN (
  'cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia',
  'breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'
);
