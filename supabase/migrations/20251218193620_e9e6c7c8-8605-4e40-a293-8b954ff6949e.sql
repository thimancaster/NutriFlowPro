-- =====================================================
-- FASE 1.3: CORREÇÃO E NORMALIZAÇÃO DOS DADOS DE ALIMENTOS
-- =====================================================

-- 1. Normalizar categorias duplicadas
UPDATE alimentos_v2 SET categoria = 'Cereais e Grãos' WHERE categoria IN ('Cereais', 'Cereais e Derivados');
UPDATE alimentos_v2 SET categoria = 'Óleos e Gorduras' WHERE categoria = 'Óleos';
UPDATE alimentos_v2 SET categoria = 'Carnes Bovinas' WHERE categoria = 'Carnes' AND nome ILIKE '%bovino%';
UPDATE alimentos_v2 SET categoria = 'Carnes Bovinas' WHERE categoria = 'Carnes' AND nome ILIKE '%boi%';
UPDATE alimentos_v2 SET categoria = 'Carnes Bovinas' WHERE categoria = 'Carnes' AND nome ILIKE '%carne%' AND categoria = 'Carnes';
UPDATE alimentos_v2 SET categoria = 'Carnes Bovinas' WHERE categoria = 'Proteínas' AND nome ILIKE '%carne%';
UPDATE alimentos_v2 SET categoria = 'Carnes Bovinas' WHERE categoria = 'Proteínas' AND nome ILIKE '%bovino%';

-- 2. Auto-categorizar "Outros" baseado no nome do alimento
-- Laticínios
UPDATE alimentos_v2 SET categoria = 'Laticínios' 
WHERE categoria = 'Outros' AND (
  nome ILIKE '%leite%' OR nome ILIKE '%queijo%' OR nome ILIKE '%iogurte%' OR 
  nome ILIKE '%requeijão%' OR nome ILIKE '%manteiga%' OR nome ILIKE '%creme%leite%'
  OR nome ILIKE '%ricota%' OR nome ILIKE '%coalhada%' OR nome ILIKE '%nata%'
);

-- Carnes Bovinas
UPDATE alimentos_v2 SET categoria = 'Carnes Bovinas'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%bife%' OR nome ILIKE '%carne moída%' OR nome ILIKE '%filé mignon%' 
  OR nome ILIKE '%picanha%' OR nome ILIKE '%alcatra%' OR nome ILIKE '%costela%bov%'
  OR nome ILIKE '%patinho%' OR nome ILIKE '%maminha%' OR nome ILIKE '%acém%'
  OR nome ILIKE '%músculo%' OR nome ILIKE '%contrafilé%' OR nome ILIKE '%coxão%'
);

-- Aves
UPDATE alimentos_v2 SET categoria = 'Aves'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%frango%' OR nome ILIKE '%peru%' OR nome ILIKE '%chester%'
  OR nome ILIKE '%pato%' OR nome ILIKE '%galinha%' OR nome ILIKE '%ave%'
);

-- Carnes Suínas
UPDATE alimentos_v2 SET categoria = 'Carnes Suínas'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%porco%' OR nome ILIKE '%suíno%' OR nome ILIKE '%bacon%'
  OR nome ILIKE '%linguiça%' OR nome ILIKE '%presunto%' OR nome ILIKE '%salame%'
  OR nome ILIKE '%calabresa%' OR nome ILIKE '%lombo%suíno%'
);

-- Peixes e Frutos do Mar
UPDATE alimentos_v2 SET categoria = 'Peixes e Frutos do Mar'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%peixe%' OR nome ILIKE '%salmão%' OR nome ILIKE '%atum%'
  OR nome ILIKE '%sardinha%' OR nome ILIKE '%camarão%' OR nome ILIKE '%bacalhau%'
  OR nome ILIKE '%tilápia%' OR nome ILIKE '%pescada%' OR nome ILIKE '%merluza%'
  OR nome ILIKE '%polvo%' OR nome ILIKE '%lula%' OR nome ILIKE '%mexilhão%'
);

-- Frutas
UPDATE alimentos_v2 SET categoria = 'Frutas'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%maçã%' OR nome ILIKE '%banana%' OR nome ILIKE '%laranja%'
  OR nome ILIKE '%morango%' OR nome ILIKE '%uva%' OR nome ILIKE '%manga%'
  OR nome ILIKE '%abacaxi%' OR nome ILIKE '%melancia%' OR nome ILIKE '%mamão%'
  OR nome ILIKE '%pera%' OR nome ILIKE '%kiwi%' OR nome ILIKE '%melão%'
  OR nome ILIKE '%acerola%' OR nome ILIKE '%goiaba%' OR nome ILIKE '%maracujá%'
);

-- Verduras e Legumes
UPDATE alimentos_v2 SET categoria = 'Verduras e Legumes'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%alface%' OR nome ILIKE '%tomate%' OR nome ILIKE '%cebola%'
  OR nome ILIKE '%cenoura%' OR nome ILIKE '%brócolis%' OR nome ILIKE '%couve%'
  OR nome ILIKE '%espinafre%' OR nome ILIKE '%pepino%' OR nome ILIKE '%abobrinha%'
  OR nome ILIKE '%berinjela%' OR nome ILIKE '%pimentão%' OR nome ILIKE '%agrião%'
);

-- Leguminosas
UPDATE alimentos_v2 SET categoria = 'Leguminosas'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%feijão%' OR nome ILIKE '%lentilha%' OR nome ILIKE '%grão de bico%'
  OR nome ILIKE '%ervilha%' OR nome ILIKE '%soja%' OR nome ILIKE '%fava%'
);

-- Tubérculos
UPDATE alimentos_v2 SET categoria = 'Tubérculos'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%batata%' OR nome ILIKE '%mandioca%' OR nome ILIKE '%inhame%'
  OR nome ILIKE '%cará%' OR nome ILIKE '%aipim%' OR nome ILIKE '%batata doce%'
);

-- Pães e Padaria
UPDATE alimentos_v2 SET categoria = 'Pães e Padaria'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%pão%' OR nome ILIKE '%bolo%' OR nome ILIKE '%biscoito%'
  OR nome ILIKE '%torrada%' OR nome ILIKE '%rosca%' OR nome ILIKE '%croissant%'
);

-- Ovos
UPDATE alimentos_v2 SET categoria = 'Ovos'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%ovo %' OR nome ILIKE '%ovos%' OR nome ILIKE '%ovo de%'
  OR nome ILIKE '%omelete%' OR nome ILIKE '%clara%ovo%' OR nome ILIKE '%gema%'
);

-- Bebidas
UPDATE alimentos_v2 SET categoria = 'Bebidas'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%suco%' OR nome ILIKE '%café%' OR nome ILIKE '%chá%'
  OR nome ILIKE '%refrigerante%' OR nome ILIKE '%água%' OR nome ILIKE '%achocolatado%'
);

-- Cereais e Grãos
UPDATE alimentos_v2 SET categoria = 'Cereais e Grãos'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%arroz%' OR nome ILIKE '%aveia%' OR nome ILIKE '%quinoa%'
  OR nome ILIKE '%granola%' OR nome ILIKE '%cereal%' OR nome ILIKE '%milho%'
  OR nome ILIKE '%trigo%' OR nome ILIKE '%centeio%'
);

-- Castanhas e Sementes
UPDATE alimentos_v2 SET categoria = 'Castanhas e Sementes'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%castanha%' OR nome ILIKE '%nozes%' OR nome ILIKE '%amêndoa%'
  OR nome ILIKE '%amendoim%' OR nome ILIKE '%pistache%' OR nome ILIKE '%semente%'
  OR nome ILIKE '%chia%' OR nome ILIKE '%linhaça%'
);

-- Molhos e Condimentos
UPDATE alimentos_v2 SET categoria = 'Molhos e Condimentos'
WHERE categoria = 'Outros' AND (
  nome ILIKE '%molho%' OR nome ILIKE '%ketchup%' OR nome ILIKE '%maionese%'
  OR nome ILIKE '%mostarda%' OR nome ILIKE '%vinagre%' OR nome ILIKE '%tempero%'
  OR nome ILIKE '%sal%' OR nome ILIKE '%açúcar%'
);

-- 3. Preencher tipo_refeicao_sugerida baseado na categoria (para os que estão vazios ou NULL)
UPDATE alimentos_v2 SET tipo_refeicao_sugerida = ARRAY['cafe_da_manha', 'lanche']
WHERE (tipo_refeicao_sugerida IS NULL OR tipo_refeicao_sugerida = '{}')
AND categoria IN ('Laticínios', 'Pães e Padaria', 'Cereais e Grãos');

UPDATE alimentos_v2 SET tipo_refeicao_sugerida = ARRAY['almoco', 'jantar']
WHERE (tipo_refeicao_sugerida IS NULL OR tipo_refeicao_sugerida = '{}')
AND categoria IN ('Carnes Bovinas', 'Carnes Suínas', 'Aves', 'Peixes e Frutos do Mar', 'Leguminosas', 'Massas');

UPDATE alimentos_v2 SET tipo_refeicao_sugerida = ARRAY['cafe_da_manha', 'lanche', 'almoco', 'jantar']
WHERE (tipo_refeicao_sugerida IS NULL OR tipo_refeicao_sugerida = '{}')
AND categoria IN ('Verduras e Legumes', 'Tubérculos');

UPDATE alimentos_v2 SET tipo_refeicao_sugerida = ARRAY['cafe_da_manha', 'lanche']
WHERE (tipo_refeicao_sugerida IS NULL OR tipo_refeicao_sugerida = '{}')
AND categoria IN ('Frutas', 'Castanhas e Sementes');

UPDATE alimentos_v2 SET tipo_refeicao_sugerida = ARRAY['cafe_da_manha', 'almoco', 'jantar']
WHERE (tipo_refeicao_sugerida IS NULL OR tipo_refeicao_sugerida = '{}')
AND categoria IN ('Ovos');

UPDATE alimentos_v2 SET tipo_refeicao_sugerida = ARRAY['cafe_da_manha', 'lanche', 'almoco', 'jantar']
WHERE (tipo_refeicao_sugerida IS NULL OR tipo_refeicao_sugerida = '{}')
AND categoria IN ('Bebidas');

-- Restante mantém como universal
UPDATE alimentos_v2 SET tipo_refeicao_sugerida = ARRAY['any']
WHERE (tipo_refeicao_sugerida IS NULL OR tipo_refeicao_sugerida = '{}');

-- 4. Criar índice para melhorar a busca full-text se não existir
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_nome_trgm ON alimentos_v2 USING gin(nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_categoria ON alimentos_v2(categoria);
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_tipo_refeicao ON alimentos_v2 USING gin(tipo_refeicao_sugerida);
CREATE INDEX IF NOT EXISTS idx_alimentos_v2_ativo_popularidade ON alimentos_v2(ativo, popularidade DESC NULLS LAST);