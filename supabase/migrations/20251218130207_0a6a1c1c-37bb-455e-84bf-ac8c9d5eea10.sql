-- Populate tipo_refeicao_sugerida based on category and food characteristics
-- This will improve the hybrid search in AutoGenerationService

UPDATE alimentos_v2 
SET tipo_refeicao_sugerida = CASE
  -- Café da manhã foods
  WHEN categoria IN ('Cereais e Grãos', 'Pães e Padaria', 'Laticínios') 
       OR LOWER(nome) LIKE '%pão%' 
       OR LOWER(nome) LIKE '%leite%' 
       OR LOWER(nome) LIKE '%queijo%'
       OR LOWER(nome) LIKE '%iogurte%'
       OR LOWER(nome) LIKE '%aveia%'
       OR LOWER(nome) LIKE '%granola%'
       OR LOWER(nome) LIKE '%cereal%'
       OR LOWER(nome) LIKE '%tapioca%'
       OR LOWER(nome) LIKE '%manteiga%'
       OR LOWER(nome) LIKE '%requeijão%'
       OR LOWER(nome) LIKE '%café%'
  THEN ARRAY['cafe_manha', 'lanche']
  
  -- Frutas - flexíveis para várias refeições
  WHEN categoria IN ('Frutas') 
       OR LOWER(nome) LIKE '%fruta%'
       OR LOWER(nome) LIKE '%banana%'
       OR LOWER(nome) LIKE '%maçã%'
       OR LOWER(nome) LIKE '%laranja%'
       OR LOWER(nome) LIKE '%mamão%'
       OR LOWER(nome) LIKE '%melancia%'
       OR LOWER(nome) LIKE '%morango%'
       OR LOWER(nome) LIKE '%uva%'
       OR LOWER(nome) LIKE '%abacaxi%'
       OR LOWER(nome) LIKE '%manga%'
  THEN ARRAY['cafe_manha', 'lanche', 'sobremesa']
  
  -- Almoço/Jantar foods (carnes, leguminosas, verduras)
  WHEN categoria IN ('Carnes Bovinas', 'Carnes Suínas', 'Aves', 'Peixes e Frutos do Mar', 'Embutidos')
       OR LOWER(nome) LIKE '%bife%'
       OR LOWER(nome) LIKE '%filé%'
       OR LOWER(nome) LIKE '%frango%'
       OR LOWER(nome) LIKE '%peixe%'
       OR LOWER(nome) LIKE '%carne%'
       OR LOWER(nome) LIKE '%costela%'
       OR LOWER(nome) LIKE '%linguiça%'
       OR LOWER(nome) LIKE '%salsicha%'
       OR LOWER(nome) LIKE '%presunto%'
       OR LOWER(nome) LIKE '%bacon%'
  THEN ARRAY['almoco', 'jantar']
  
  -- Leguminosas e grãos para almoço/jantar
  WHEN categoria IN ('Leguminosas')
       OR LOWER(nome) LIKE '%feijão%'
       OR LOWER(nome) LIKE '%lentilha%'
       OR LOWER(nome) LIKE '%grão de bico%'
       OR LOWER(nome) LIKE '%ervilha%'
       OR LOWER(nome) LIKE '%soja%'
  THEN ARRAY['almoco', 'jantar']
  
  -- Verduras e legumes
  WHEN categoria IN ('Verduras e Legumes')
       OR LOWER(nome) LIKE '%alface%'
       OR LOWER(nome) LIKE '%tomate%'
       OR LOWER(nome) LIKE '%cenoura%'
       OR LOWER(nome) LIKE '%brócolis%'
       OR LOWER(nome) LIKE '%couve%'
       OR LOWER(nome) LIKE '%abobrinha%'
       OR LOWER(nome) LIKE '%berinjela%'
       OR LOWER(nome) LIKE '%pepino%'
       OR LOWER(nome) LIKE '%cebola%'
       OR LOWER(nome) LIKE '%alho%'
  THEN ARRAY['almoco', 'jantar']
  
  -- Tubérculos
  WHEN categoria IN ('Tubérculos')
       OR LOWER(nome) LIKE '%batata%'
       OR LOWER(nome) LIKE '%mandioca%'
       OR LOWER(nome) LIKE '%inhame%'
       OR LOWER(nome) LIKE '%cará%'
  THEN ARRAY['almoco', 'jantar']
  
  -- Massas
  WHEN categoria IN ('Massas')
       OR LOWER(nome) LIKE '%macarrão%'
       OR LOWER(nome) LIKE '%espaguete%'
       OR LOWER(nome) LIKE '%lasanha%'
       OR LOWER(nome) LIKE '%nhoque%'
  THEN ARRAY['almoco', 'jantar']
  
  -- Arroz
  WHEN LOWER(nome) LIKE '%arroz%'
  THEN ARRAY['almoco', 'jantar']
  
  -- Lanches e snacks
  WHEN categoria IN ('Lanches e Salgados', 'Castanhas e Sementes')
       OR LOWER(nome) LIKE '%biscoito%'
       OR LOWER(nome) LIKE '%bolacha%'
       OR LOWER(nome) LIKE '%salgado%'
       OR LOWER(nome) LIKE '%amendoim%'
       OR LOWER(nome) LIKE '%castanha%'
       OR LOWER(nome) LIKE '%noz%'
       OR LOWER(nome) LIKE '%amêndoa%'
       OR LOWER(nome) LIKE '%barra%'
  THEN ARRAY['lanche']
  
  -- Doces e sobremesas
  WHEN categoria IN ('Doces e Sobremesas')
       OR LOWER(nome) LIKE '%doce%'
       OR LOWER(nome) LIKE '%chocolate%'
       OR LOWER(nome) LIKE '%sorvete%'
       OR LOWER(nome) LIKE '%pudim%'
       OR LOWER(nome) LIKE '%bolo%'
       OR LOWER(nome) LIKE '%torta%'
  THEN ARRAY['sobremesa', 'lanche']
  
  -- Ovos - café da manhã e jantar
  WHEN categoria IN ('Ovos')
       OR LOWER(nome) LIKE '%ovo%'
  THEN ARRAY['cafe_manha', 'almoco', 'jantar']
  
  -- Bebidas
  WHEN categoria IN ('Bebidas')
       OR LOWER(nome) LIKE '%suco%'
       OR LOWER(nome) LIKE '%refrigerante%'
       OR LOWER(nome) LIKE '%água%'
       OR LOWER(nome) LIKE '%chá%'
  THEN ARRAY['cafe_manha', 'almoco', 'jantar', 'lanche']
  
  -- Default: flexível para almoço e jantar
  ELSE ARRAY['almoco', 'jantar']
END
WHERE tipo_refeicao_sugerida IS NULL OR array_length(tipo_refeicao_sugerida, 1) IS NULL;