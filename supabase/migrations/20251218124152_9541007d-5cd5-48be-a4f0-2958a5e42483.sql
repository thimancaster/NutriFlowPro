-- Reclassificação de alimentos da categoria "Outros" para categorias corretas
-- Baseado nas regras de keywords do edge function reclassify-foods

DO $$
DECLARE
    updated_count integer := 0;
BEGIN
    -- Peixes e Frutos do Mar
    UPDATE alimentos_v2 SET categoria = 'Peixes e Frutos do Mar', descricao_curta = nome || ', fonte de proteína magra e ômega-3', preparo_sugerido = 'Grelhado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%robalo%' OR lower(nome) LIKE '%salmão%' OR lower(nome) LIKE '%tilápia%' OR 
        lower(nome) LIKE '%atum%' OR lower(nome) LIKE '%camarão%' OR lower(nome) LIKE '%mexilhão%' OR 
        lower(nome) LIKE '%peixe%' OR lower(nome) LIKE '%bacalhau%' OR lower(nome) LIKE '%sardinha%' OR 
        lower(nome) LIKE '%anchova%' OR lower(nome) LIKE '%pescada%' OR lower(nome) LIKE '%merluza%' OR 
        lower(nome) LIKE '%truta%' OR lower(nome) LIKE '%linguado%' OR lower(nome) LIKE '%badejo%' OR 
        lower(nome) LIKE '%garoupa%' OR lower(nome) LIKE '%carpa%' OR lower(nome) LIKE '%corvina%' OR 
        lower(nome) LIKE '%namorado%' OR lower(nome) LIKE '%dourado%' OR lower(nome) LIKE '%cavalinha%' OR 
        lower(nome) LIKE '%arenque%' OR lower(nome) LIKE '%lagosta%' OR lower(nome) LIKE '%caranguejo%' OR 
        lower(nome) LIKE '%siri%' OR lower(nome) LIKE '%polvo%' OR lower(nome) LIKE '%lula%' OR 
        lower(nome) LIKE '%ostra%' OR lower(nome) LIKE '%vieira%' OR lower(nome) LIKE '%marisco%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Peixes e Frutos do Mar: % registros', updated_count;

    -- Carnes Bovinas
    UPDATE alimentos_v2 SET categoria = 'Carnes Bovinas', descricao_curta = nome || ', rico em proteínas, ferro e vitaminas do complexo B', preparo_sugerido = 'Grelhado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%picanha%' OR lower(nome) LIKE '%maminha%' OR lower(nome) LIKE '%alcatra%' OR 
        lower(nome) LIKE '%patinho%' OR lower(nome) LIKE '%costela%' OR lower(nome) LIKE '%bife%' OR 
        lower(nome) LIKE '%carne bovina%' OR lower(nome) LIKE '%filé mignon%' OR lower(nome) LIKE '%contrafilé%' OR 
        lower(nome) LIKE '%coxão%' OR lower(nome) LIKE '%acém%' OR lower(nome) LIKE '%músculo%' OR 
        lower(nome) LIKE '%lagarto%' OR lower(nome) LIKE '%paleta%' OR lower(nome) LIKE '%cupim%' OR 
        lower(nome) LIKE '%fraldinha%' OR lower(nome) LIKE '%chã de dentro%' OR lower(nome) LIKE '%chã de fora%' OR 
        lower(nome) LIKE '%carne moída%' OR lower(nome) LIKE '%mocotó%' OR lower(nome) LIKE '%fígado bovino%' OR 
        lower(nome) LIKE '%língua bovina%' OR lower(nome) LIKE '%boi%' OR lower(nome) LIKE '%bovino%' OR
        lower(nome) LIKE '%carne,%' OR lower(nome) LIKE '%carne %'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Carnes Bovinas: % registros', updated_count;

    -- Carnes Suínas
    UPDATE alimentos_v2 SET categoria = 'Carnes Suínas', descricao_curta = nome || ', fonte de proteína e vitamina B1', preparo_sugerido = 'Assado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%porco%' OR lower(nome) LIKE '%bacon%' OR lower(nome) LIKE '%lombo%' OR 
        lower(nome) LIKE '%pernil%' OR lower(nome) LIKE '%linguiça%' OR lower(nome) LIKE '%suíno%' OR 
        lower(nome) LIKE '%presunto%' OR lower(nome) LIKE '%costela suína%' OR lower(nome) LIKE '%copa%' OR 
        lower(nome) LIKE '%panceta%' OR lower(nome) LIKE '%torresmo%' OR lower(nome) LIKE '%salame%' OR 
        lower(nome) LIKE '%mortadela%' OR lower(nome) LIKE '%paio%' OR lower(nome) LIKE '%chouriço%' OR 
        lower(nome) LIKE '%bisteca%' OR lower(nome) LIKE '%tender%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Carnes Suínas: % registros', updated_count;

    -- Aves
    UPDATE alimentos_v2 SET categoria = 'Aves', descricao_curta = nome || ', proteína magra de fácil digestão', preparo_sugerido = 'Grelhado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%frango%' OR lower(nome) LIKE '%peru%' OR lower(nome) LIKE '%pato%' OR 
        lower(nome) LIKE '%galinha%' OR lower(nome) LIKE '%peito de frango%' OR lower(nome) LIKE '%coxa%' OR 
        lower(nome) LIKE '%sobrecoxa%' OR lower(nome) LIKE '%asa%' OR lower(nome) LIKE '%coração de frango%' OR 
        lower(nome) LIKE '%moela%' OR lower(nome) LIKE '%fígado de frango%' OR lower(nome) LIKE '%chester%' OR 
        lower(nome) LIKE '%codorna%' OR lower(nome) LIKE '%faisão%' OR lower(nome) LIKE '%avestruz%' OR 
        lower(nome) LIKE '%nuggets%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Aves: % registros', updated_count;

    -- Cereais e Grãos
    UPDATE alimentos_v2 SET categoria = 'Cereais e Grãos', descricao_curta = nome || ', fonte de carboidratos complexos e fibras', preparo_sugerido = 'Cozido'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%arroz%' OR lower(nome) LIKE '%aveia%' OR lower(nome) LIKE '%quinoa%' OR 
        lower(nome) LIKE '%milho%' OR lower(nome) LIKE '%trigo%' OR lower(nome) LIKE '%cevada%' OR 
        lower(nome) LIKE '%sorgo%' OR lower(nome) LIKE '%centeio%' OR lower(nome) LIKE '%farinha%' OR 
        lower(nome) LIKE '%fubá%' OR lower(nome) LIKE '%amido%' OR lower(nome) LIKE '%polvilho%' OR 
        lower(nome) LIKE '%tapioca%' OR lower(nome) LIKE '%flocos%' OR lower(nome) LIKE '%granola%' OR 
        lower(nome) LIKE '%muesli%' OR lower(nome) LIKE '%gérmen%' OR lower(nome) LIKE '%farelo%' OR 
        lower(nome) LIKE '%bulgur%' OR lower(nome) LIKE '%cuscuz%' OR lower(nome) LIKE '%painço%' OR
        lower(nome) LIKE '%cereal%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Cereais e Grãos: % registros', updated_count;

    -- Massas
    UPDATE alimentos_v2 SET categoria = 'Massas', descricao_curta = nome || ', carboidrato de energia rápida', preparo_sugerido = 'Cozida al dente'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%macarrão%' OR lower(nome) LIKE '%espaguete%' OR lower(nome) LIKE '%penne%' OR 
        lower(nome) LIKE '%fusilli%' OR lower(nome) LIKE '%lasanha%' OR lower(nome) LIKE '%ravióli%' OR 
        lower(nome) LIKE '%capeletti%' OR lower(nome) LIKE '%nhoque%' OR lower(nome) LIKE '%talharim%' OR 
        lower(nome) LIKE '%fetuccine%' OR lower(nome) LIKE '%rigatoni%' OR lower(nome) LIKE '%farfalle%' OR 
        lower(nome) LIKE '%conchiglioni%' OR lower(nome) LIKE '%cannelloni%' OR lower(nome) LIKE '%tortellini%' OR
        lower(nome) LIKE '%massa%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Massas: % registros', updated_count;

    -- Leguminosas
    UPDATE alimentos_v2 SET categoria = 'Leguminosas', descricao_curta = nome || ', excelente fonte de proteína vegetal e fibras', preparo_sugerido = 'Cozido'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%feijão%' OR lower(nome) LIKE '%lentilha%' OR lower(nome) LIKE '%grão-de-bico%' OR 
        lower(nome) LIKE '%grão de bico%' OR lower(nome) LIKE '%ervilha%' OR lower(nome) LIKE '%soja%' OR 
        lower(nome) LIKE '%fava%' OR lower(nome) LIKE '%tremoço%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Leguminosas: % registros', updated_count;

    -- Frutas
    UPDATE alimentos_v2 SET categoria = 'Frutas', descricao_curta = nome || ', rica em vitaminas, minerais e antioxidantes', preparo_sugerido = 'In natura'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%banana%' OR lower(nome) LIKE '%maçã%' OR lower(nome) LIKE '%laranja%' OR 
        lower(nome) LIKE '%manga%' OR lower(nome) LIKE '%abacate%' OR lower(nome) LIKE '%morango%' OR 
        lower(nome) LIKE '%uva%' OR lower(nome) LIKE '%melão%' OR lower(nome) LIKE '%melancia%' OR 
        lower(nome) LIKE '%mamão%' OR lower(nome) LIKE '%abacaxi%' OR lower(nome) LIKE '%kiwi%' OR 
        lower(nome) LIKE '%pêra%' OR lower(nome) LIKE '%pêssego%' OR lower(nome) LIKE '%ameixa%' OR 
        lower(nome) LIKE '%cereja%' OR lower(nome) LIKE '%framboesa%' OR lower(nome) LIKE '%mirtilo%' OR 
        lower(nome) LIKE '%açaí%' OR lower(nome) LIKE '%goiaba%' OR lower(nome) LIKE '%maracujá%' OR 
        lower(nome) LIKE '%limão%' OR lower(nome) LIKE '%tangerina%' OR lower(nome) LIKE '%mexerica%' OR 
        lower(nome) LIKE '%caqui%' OR lower(nome) LIKE '%figo%' OR lower(nome) LIKE '%romã%' OR 
        lower(nome) LIKE '%lichia%' OR lower(nome) LIKE '%carambola%' OR lower(nome) LIKE '%pitaya%' OR 
        lower(nome) LIKE '%coco%' OR lower(nome) LIKE '%jabuticaba%' OR lower(nome) LIKE '%acerola%' OR 
        lower(nome) LIKE '%cajá%' OR lower(nome) LIKE '%graviola%' OR lower(nome) LIKE '%cupuaçu%' OR 
        lower(nome) LIKE '%jaca%' OR lower(nome) LIKE '%fruta%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Frutas: % registros', updated_count;

    -- Verduras e Legumes
    UPDATE alimentos_v2 SET categoria = 'Verduras e Legumes', descricao_curta = nome || ', fonte de fibras, vitaminas e minerais', preparo_sugerido = 'Cru ou refogado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%alface%' OR lower(nome) LIKE '%tomate%' OR lower(nome) LIKE '%cebola%' OR 
        lower(nome) LIKE '%cenoura%' OR lower(nome) LIKE '%brócolis%' OR lower(nome) LIKE '%espinafre%' OR 
        lower(nome) LIKE '%chuchu%' OR lower(nome) LIKE '%palmito%' OR lower(nome) LIKE '%abobrinha%' OR 
        lower(nome) LIKE '%berinjela%' OR lower(nome) LIKE '%pimentão%' OR lower(nome) LIKE '%pepino%' OR 
        lower(nome) LIKE '%repolho%' OR lower(nome) LIKE '%couve%' OR lower(nome) LIKE '%acelga%' OR 
        lower(nome) LIKE '%agrião%' OR lower(nome) LIKE '%rúcula%' OR lower(nome) LIKE '%chicória%' OR 
        lower(nome) LIKE '%escarola%' OR lower(nome) LIKE '%almeirão%' OR lower(nome) LIKE '%mostarda%' OR 
        lower(nome) LIKE '%nabo%' OR lower(nome) LIKE '%rabanete%' OR lower(nome) LIKE '%beterraba%' OR 
        lower(nome) LIKE '%quiabo%' OR lower(nome) LIKE '%jiló%' OR lower(nome) LIKE '%maxixe%' OR 
        lower(nome) LIKE '%abóbora%' OR lower(nome) LIKE '%moranga%' OR lower(nome) LIKE '%vagem%' OR 
        lower(nome) LIKE '%aspargo%' OR lower(nome) LIKE '%alcachofra%' OR lower(nome) LIKE '%aipo%' OR 
        lower(nome) LIKE '%salsão%' OR lower(nome) LIKE '%funcho%' OR lower(nome) LIKE '%couve-flor%' OR 
        lower(nome) LIKE '%salada%' OR lower(nome) LIKE '%folha%' OR lower(nome) LIKE '%legume%' OR 
        lower(nome) LIKE '%verdura%' OR lower(nome) LIKE '%hortaliça%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Verduras e Legumes: % registros', updated_count;

    -- Tubérculos
    UPDATE alimentos_v2 SET categoria = 'Tubérculos', descricao_curta = nome || ', carboidrato de absorção lenta', preparo_sugerido = 'Cozido ou assado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%batata%' OR lower(nome) LIKE '%mandioca%' OR lower(nome) LIKE '%inhame%' OR 
        lower(nome) LIKE '%cará%' OR lower(nome) LIKE '%aipim%' OR lower(nome) LIKE '%macaxeira%' OR 
        lower(nome) LIKE '%mandioquinha%' OR lower(nome) LIKE '%baroa%' OR lower(nome) LIKE '%taro%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Tubérculos: % registros', updated_count;

    -- Laticínios
    UPDATE alimentos_v2 SET categoria = 'Laticínios', descricao_curta = nome || ', fonte de cálcio e proteínas de alto valor biológico', preparo_sugerido = 'Puro'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%leite%' OR lower(nome) LIKE '%queijo%' OR lower(nome) LIKE '%iogurte%' OR 
        lower(nome) LIKE '%requeijão%' OR lower(nome) LIKE '%manteiga%' OR lower(nome) LIKE '%creme de leite%' OR 
        lower(nome) LIKE '%nata%' OR lower(nome) LIKE '%coalhada%' OR lower(nome) LIKE '%ricota%' OR 
        lower(nome) LIKE '%cottage%' OR lower(nome) LIKE '%mussarela%' OR lower(nome) LIKE '%parmesão%' OR 
        lower(nome) LIKE '%provolone%' OR lower(nome) LIKE '%gorgonzola%' OR lower(nome) LIKE '%brie%' OR 
        lower(nome) LIKE '%camembert%' OR lower(nome) LIKE '%cream cheese%' OR lower(nome) LIKE '%petit suisse%' OR 
        lower(nome) LIKE '%kefir%' OR lower(nome) LIKE '%lácteo%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Laticínios: % registros', updated_count;

    -- Óleos e Gorduras
    UPDATE alimentos_v2 SET categoria = 'Óleos e Gorduras', descricao_curta = nome || ', fonte de gorduras e energia', preparo_sugerido = 'Para temperar'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%óleo%' OR lower(nome) LIKE '%azeite%' OR lower(nome) LIKE '%margarina%' OR 
        lower(nome) LIKE '%banha%' OR lower(nome) LIKE '%gordura%' OR lower(nome) LIKE '%manteiga de cacau%' OR 
        lower(nome) LIKE '%ghee%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Óleos e Gorduras: % registros', updated_count;

    -- Bebidas
    UPDATE alimentos_v2 SET categoria = 'Bebidas', descricao_curta = nome || ', opção para hidratação', preparo_sugerido = 'Gelado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%suco%' OR lower(nome) LIKE '%café%' OR lower(nome) LIKE '%chá%' OR 
        lower(nome) LIKE '%refrigerante%' OR lower(nome) LIKE '%água de coco%' OR lower(nome) LIKE '%bebida%' OR 
        lower(nome) LIKE '%achocolatado%' OR lower(nome) LIKE '%vitamina%' OR lower(nome) LIKE '%smoothie%' OR 
        lower(nome) LIKE '%shake%' OR lower(nome) LIKE '%isotônico%' OR lower(nome) LIKE '%energético%' OR 
        lower(nome) LIKE '%cerveja%' OR lower(nome) LIKE '%vinho%' OR lower(nome) LIKE '%cachaça%' OR 
        lower(nome) LIKE '%licor%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Bebidas: % registros', updated_count;

    -- Pães e Padaria
    UPDATE alimentos_v2 SET categoria = 'Pães e Padaria', descricao_curta = nome || ', carboidrato para energia imediata', preparo_sugerido = 'Puro'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%pão%' OR lower(nome) LIKE '%baguete%' OR lower(nome) LIKE '%ciabatta%' OR 
        lower(nome) LIKE '%brioche%' OR lower(nome) LIKE '%sonho%' OR lower(nome) LIKE '%rosquinha%' OR 
        lower(nome) LIKE '%biscoito%' OR lower(nome) LIKE '%bolacha%' OR lower(nome) LIKE '%torrada%' OR 
        lower(nome) LIKE '%bisnaguinha%' OR lower(nome) LIKE '%bolo%' OR lower(nome) LIKE '%muffin%' OR 
        lower(nome) LIKE '%cupcake%' OR lower(nome) LIKE '%brownie%' OR lower(nome) LIKE '%croissant%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Pães e Padaria: % registros', updated_count;

    -- Doces e Sobremesas
    UPDATE alimentos_v2 SET categoria = 'Doces e Sobremesas', descricao_curta = nome || ', opção para consumo moderado', preparo_sugerido = 'Servir gelado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%doce%' OR lower(nome) LIKE '%sobremesa%' OR lower(nome) LIKE '%pudim%' OR 
        lower(nome) LIKE '%mousse%' OR lower(nome) LIKE '%sorvete%' OR lower(nome) LIKE '%picolé%' OR 
        lower(nome) LIKE '%gelatina%' OR lower(nome) LIKE '%chocolate%' OR lower(nome) LIKE '%bombom%' OR 
        lower(nome) LIKE '%trufa%' OR lower(nome) LIKE '%brigadeiro%' OR lower(nome) LIKE '%beijinho%' OR 
        lower(nome) LIKE '%cajuzinho%' OR lower(nome) LIKE '%cocada%' OR lower(nome) LIKE '%paçoca%' OR 
        lower(nome) LIKE '%rapadura%' OR lower(nome) LIKE '%goiabada%' OR lower(nome) LIKE '%marmelada%' OR 
        lower(nome) LIKE '%geleia%' OR lower(nome) LIKE '%compota%' OR lower(nome) LIKE '%mel%' OR 
        lower(nome) LIKE '%melado%' OR lower(nome) LIKE '%xarope%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Doces e Sobremesas: % registros', updated_count;

    -- Castanhas e Sementes
    UPDATE alimentos_v2 SET categoria = 'Castanhas e Sementes', descricao_curta = nome || ', fonte de gorduras boas e minerais', preparo_sugerido = 'Torradas ou in natura'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%castanha%' OR lower(nome) LIKE '%nozes%' OR lower(nome) LIKE '%amêndoa%' OR 
        lower(nome) LIKE '%avelã%' OR lower(nome) LIKE '%pistache%' OR lower(nome) LIKE '%macadâmia%' OR 
        lower(nome) LIKE '%semente%' OR lower(nome) LIKE '%chia%' OR lower(nome) LIKE '%linhaça%' OR 
        lower(nome) LIKE '%gergelim%' OR lower(nome) LIKE '%girassol%' OR lower(nome) LIKE '%amendoim%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Castanhas e Sementes: % registros', updated_count;

    -- Ovos
    UPDATE alimentos_v2 SET categoria = 'Ovos', descricao_curta = nome || ', proteína completa com todos aminoácidos essenciais', preparo_sugerido = 'Cozido ou mexido'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%ovo%' OR lower(nome) LIKE '%clara%' OR lower(nome) LIKE '%gema%' OR 
        lower(nome) LIKE '%omelete%' OR lower(nome) LIKE '%ovos%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Ovos: % registros', updated_count;

    -- Embutidos
    UPDATE alimentos_v2 SET categoria = 'Embutidos', descricao_curta = nome || ', consumir com moderação', preparo_sugerido = 'Grelhado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%salsicha%' OR lower(nome) LIKE '%calabresa%' OR lower(nome) LIKE '%chorizo%' OR 
        lower(nome) LIKE '%hot dog%' OR lower(nome) LIKE '%peito de peru%' OR lower(nome) LIKE '%blanquet%' OR 
        lower(nome) LIKE '%apresuntado%' OR lower(nome) LIKE '%copa lombo%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Embutidos: % registros', updated_count;

    -- Lanches e Salgados
    UPDATE alimentos_v2 SET categoria = 'Lanches e Salgados', descricao_curta = nome || ', opção para lanches rápidos', preparo_sugerido = 'Assado'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%coxinha%' OR lower(nome) LIKE '%pastel%' OR lower(nome) LIKE '%empada%' OR 
        lower(nome) LIKE '%pão de queijo%' OR lower(nome) LIKE '%esfiha%' OR lower(nome) LIKE '%kibe%' OR 
        lower(nome) LIKE '%bolinha%' OR lower(nome) LIKE '%risole%' OR lower(nome) LIKE '%enroladinho%' OR 
        lower(nome) LIKE '%folhado%' OR lower(nome) LIKE '%salgado%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Lanches e Salgados: % registros', updated_count;

    -- Molhos e Condimentos
    UPDATE alimentos_v2 SET categoria = 'Molhos e Condimentos', descricao_curta = nome || ', para temperar e realçar sabores', preparo_sugerido = 'Como acompanhamento'
    WHERE categoria = 'Outros' AND ativo = true AND (
        lower(nome) LIKE '%molho%' OR lower(nome) LIKE '%ketchup%' OR lower(nome) LIKE '%mostarda%' OR 
        lower(nome) LIKE '%maionese%' OR lower(nome) LIKE '%vinagrete%' OR lower(nome) LIKE '%shoyu%' OR 
        lower(nome) LIKE '%missô%' OR lower(nome) LIKE '%tahine%' OR lower(nome) LIKE '%pesto%' OR 
        lower(nome) LIKE '%chimichurri%' OR lower(nome) LIKE '%barbecue%' OR lower(nome) LIKE '%tempero%' OR 
        lower(nome) LIKE '%curry%' OR lower(nome) LIKE '%açafrão%' OR lower(nome) LIKE '%noz-moscada%' OR 
        lower(nome) LIKE '%orégano%' OR lower(nome) LIKE '%manjericão%' OR lower(nome) LIKE '%salsa%' OR 
        lower(nome) LIKE '%cebolinha%' OR lower(nome) LIKE '%coentro%' OR lower(nome) LIKE '%alho%' OR 
        lower(nome) LIKE '%gengibre%' OR lower(nome) LIKE '%pimenta%'
    );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Molhos e Condimentos: % registros', updated_count;

    -- Atualizar updated_at para todos os registros modificados
    UPDATE alimentos_v2 SET updated_at = now() WHERE updated_at > now() - interval '1 minute';
    
END $$;