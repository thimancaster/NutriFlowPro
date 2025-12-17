import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Category classification rules
const CATEGORY_RULES: Record<string, string[]> = {
  'Peixes e Frutos do Mar': [
    'robalo', 'salmão', 'tilápia', 'atum', 'camarão', 'mexilhão', 'peixe',
    'bacalhau', 'sardinha', 'anchova', 'pescada', 'merluza', 'truta',
    'linguado', 'badejo', 'garoupa', 'carpa', 'corvina', 'namorado',
    'dourado', 'cavalinha', 'arenque', 'lagosta', 'caranguejo', 'siri',
    'polvo', 'lula', 'ostra', 'vieira', 'marisco', 'sururu', 'berbigão'
  ],
  'Carnes Bovinas': [
    'picanha', 'maminha', 'alcatra', 'patinho', 'costela', 'bife',
    'carne bovina', 'filé mignon', 'contrafilé', 'coxão', 'acém',
    'músculo', 'lagarto', 'paleta', 'cupim', 'fraldinha', 'chã de dentro',
    'chã de fora', 'carne moída', 'mocotó', 'fígado bovino', 'língua bovina'
  ],
  'Carnes Suínas': [
    'porco', 'bacon', 'lombo', 'pernil', 'linguiça', 'suíno', 'presunto',
    'costela suína', 'copa', 'panceta', 'torresmo', 'salame', 'mortadela',
    'paio', 'chouriço', 'bisteca suína', 'tender'
  ],
  'Aves': [
    'frango', 'peru', 'pato', 'galinha', 'peito de frango', 'coxa',
    'sobrecoxa', 'asa', 'coração de frango', 'moela', 'fígado de frango',
    'chester', 'codorna', 'faisão', 'avestruz', 'nuggets'
  ],
  'Cereais e Grãos': [
    'arroz', 'aveia', 'quinoa', 'milho', 'trigo', 'cevada', 'sorgo', 'centeio',
    'farinha', 'fubá', 'amido', 'polvilho', 'tapioca', 'flocos', 'granola',
    'muesli', 'gérmen', 'farelo', 'bulgur', 'cuscuz', 'painço'
  ],
  'Massas': [
    'macarrão', 'espaguete', 'penne', 'fusilli', 'lasanha', 'ravióli',
    'capeletti', 'nhoque', 'talharim', 'fetuccine', 'rigatoni', 'farfalle',
    'conchiglioni', 'cannelloni', 'tortellini', 'massa'
  ],
  'Leguminosas': [
    'feijão', 'lentilha', 'grão-de-bico', 'ervilha', 'soja', 'fava',
    'tremoço', 'amendoim', 'grão de bico'
  ],
  'Frutas': [
    'banana', 'maçã', 'laranja', 'manga', 'abacate', 'morango', 'uva',
    'melão', 'melancia', 'mamão', 'abacaxi', 'kiwi', 'pêra', 'pêssego',
    'ameixa', 'cereja', 'framboesa', 'mirtilo', 'açaí', 'goiaba',
    'maracujá', 'limão', 'lima', 'tangerina', 'mexerica', 'caqui',
    'figo', 'romã', 'lichia', 'carambola', 'pitaya', 'coco', 'tamarindo',
    'jabuticaba', 'acerola', 'cajá', 'graviola', 'cupuaçu', 'umbu',
    'jaca', 'fruta', 'seriguela', 'sapoti'
  ],
  'Verduras e Legumes': [
    'alface', 'tomate', 'cebola', 'cenoura', 'brócolis', 'espinafre', 'chuchu',
    'palmito', 'abobrinha', 'berinjela', 'pimentão', 'pepino', 'repolho',
    'couve', 'acelga', 'agrião', 'rúcula', 'chicória', 'escarola', 'almeirão',
    'mostarda', 'nabo', 'rabanete', 'beterraba', 'quiabo', 'jiló',
    'maxixe', 'abóbora', 'moranga', 'vagem', 'ervilha torta', 'aspargo',
    'alcachofra', 'aipo', 'salsão', 'funcho', 'couve-flor', 'salada',
    'folha', 'legume', 'verdura'
  ],
  'Tubérculos': [
    'batata', 'mandioca', 'inhame', 'batata-doce', 'cará', 'batata doce',
    'aipim', 'macaxeira', 'mandioquinha', 'baroa', 'taro'
  ],
  'Laticínios': [
    'leite', 'queijo', 'iogurte', 'requeijão', 'manteiga', 'creme de leite',
    'nata', 'coalhada', 'ricota', 'cottage', 'mussarela', 'parmesão',
    'provolone', 'gorgonzola', 'brie', 'camembert', 'cream cheese',
    'petit suisse', 'kefir', 'lácteo'
  ],
  'Óleos e Gorduras': [
    'óleo', 'azeite', 'margarina', 'banha', 'gordura', 'manteiga de cacau',
    'óleo de coco', 'óleo de palma', 'ghee'
  ],
  'Bebidas': [
    'suco', 'café', 'chá', 'refrigerante', 'água de coco', 'bebida',
    'achocolatado', 'vitamina', 'smoothie', 'shake', 'isotônico',
    'energético', 'cerveja', 'vinho', 'destilado', 'cachaça', 'licor'
  ],
  'Lanches e Salgados': [
    'coxinha', 'pastel', 'empada', 'pão de queijo', 'esfiha', 'kibe',
    'bolinha', 'risole', 'enroladinho', 'croissant', 'folhado', 'salgado'
  ],
  'Pães e Padaria': [
    'pão', 'baguete', 'ciabatta', 'brioche', 'sonho', 'rosquinha',
    'biscoito', 'bolacha', 'torrada', 'bisnaguinha', 'pão de forma',
    'pão francês', 'pão integral', 'bolo', 'muffin', 'cupcake', 'brownie'
  ],
  'Molhos e Condimentos': [
    'molho', 'ketchup', 'mostarda', 'maionese', 'vinagrete', 'shoyu',
    'missô', 'tahine', 'pesto', 'chimichurri', 'barbecue', 'tempero',
    'sal', 'pimenta', 'curry', 'açafrão', 'noz-moscada', 'orégano',
    'manjericão', 'salsa', 'cebolinha', 'coentro', 'alho', 'gengibre'
  ],
  'Doces e Sobremesas': [
    'doce', 'sobremesa', 'pudim', 'mousse', 'sorvete', 'picolé', 'gelatina',
    'chocolate', 'bombom', 'trufa', 'brigadeiro', 'beijinho', 'cajuzinho',
    'cocada', 'paçoca', 'rapadura', 'goiabada', 'marmelada', 'geleia',
    'compota', 'açúcar', 'mel', 'melado', 'xarope'
  ],
  'Castanhas e Sementes': [
    'castanha', 'nozes', 'amêndoa', 'avelã', 'pistache', 'macadâmia',
    'semente', 'chia', 'linhaça', 'gergelim', 'girassol'
  ],
  'Ovos': [
    'ovo', 'clara', 'gema', 'omelete', 'ovos'
  ],
  'Embutidos': [
    'salsicha', 'calabresa', 'chorizo', 'hot dog', 'peito de peru',
    'blanquet', 'apresuntado', 'copa lombo'
  ],
};

// Description templates
const DESCRIPTION_TEMPLATES: Record<string, (nome: string) => string> = {
  'Peixes e Frutos do Mar': (nome) => `${nome}, fonte de proteína magra e ômega-3`,
  'Carnes Bovinas': (nome) => `${nome}, rico em proteínas, ferro e vitaminas do complexo B`,
  'Carnes Suínas': (nome) => `${nome}, fonte de proteína e vitamina B1`,
  'Aves': (nome) => `${nome}, proteína magra de fácil digestão`,
  'Cereais e Grãos': (nome) => `${nome}, fonte de carboidratos complexos e fibras`,
  'Massas': (nome) => `${nome}, carboidrato de energia rápida`,
  'Leguminosas': (nome) => `${nome}, excelente fonte de proteína vegetal e fibras`,
  'Frutas': (nome) => `${nome}, rica em vitaminas, minerais e antioxidantes`,
  'Verduras e Legumes': (nome) => `${nome}, fonte de fibras, vitaminas e minerais`,
  'Tubérculos': (nome) => `${nome}, carboidrato de absorção lenta`,
  'Laticínios': (nome) => `${nome}, fonte de cálcio e proteínas de alto valor biológico`,
  'Óleos e Gorduras': (nome) => `${nome}, fonte de gorduras e energia`,
  'Bebidas': (nome) => `${nome}, opção para hidratação`,
  'Lanches e Salgados': (nome) => `${nome}, opção para lanches rápidos`,
  'Pães e Padaria': (nome) => `${nome}, carboidrato para energia imediata`,
  'Molhos e Condimentos': (nome) => `${nome}, para temperar e realçar sabores`,
  'Doces e Sobremesas': (nome) => `${nome}, opção para consumo moderado`,
  'Castanhas e Sementes': (nome) => `${nome}, fonte de gorduras boas e minerais`,
  'Ovos': (nome) => `${nome}, proteína completa com todos aminoácidos essenciais`,
  'Embutidos': (nome) => `${nome}, consumir com moderação`,
  'Outros': (nome) => `${nome}`,
};

// Preparation suggestions
const PREPARO_TEMPLATES: Record<string, string[]> = {
  'Peixes e Frutos do Mar': ['Grelhado', 'Assado', 'Cozido no vapor'],
  'Carnes Bovinas': ['Grelhado', 'Assado', 'Ensopado'],
  'Carnes Suínas': ['Assado', 'Grelhado', 'Na brasa'],
  'Aves': ['Grelhado', 'Assado', 'Cozido'],
  'Cereais e Grãos': ['Cozido', 'Em mingau'],
  'Massas': ['Cozida al dente', 'Com molho'],
  'Leguminosas': ['Cozido', 'Em sopa'],
  'Frutas': ['In natura', 'Em suco'],
  'Verduras e Legumes': ['Cru', 'Refogado', 'No vapor'],
  'Tubérculos': ['Cozido', 'Assado', 'Em purê'],
  'Laticínios': ['Puro', 'Em preparações'],
  'Óleos e Gorduras': ['Para temperar'],
  'Bebidas': ['Gelado', 'Quente'],
  'Lanches e Salgados': ['Assado', 'Frito'],
  'Pães e Padaria': ['Puro', 'Com recheio'],
  'Molhos e Condimentos': ['Como acompanhamento'],
  'Doces e Sobremesas': ['Servir gelado'],
  'Castanhas e Sementes': ['Torradas', 'In natura'],
  'Ovos': ['Cozido', 'Frito', 'Mexido'],
  'Embutidos': ['Grelhado', 'Frito'],
  'Outros': ['Conforme indicação'],
};

function classifyFood(foodName: string): string {
  const nameLower = foodName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'Outros';
}

function generateDescription(nome: string, category: string): string {
  const template = DESCRIPTION_TEMPLATES[category] || DESCRIPTION_TEMPLATES['Outros'];
  return template(nome);
}

function getSuggestedPreparo(category: string): string {
  const preparos = PREPARO_TEMPLATES[category] || PREPARO_TEMPLATES['Outros'];
  return preparos[0];
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, batchSize = 100, dryRun = false } = await req.json();
    
    console.log(`[reclassify-foods] Action: ${action}, batchSize: ${batchSize}, dryRun: ${dryRun}`);

    if (action === 'stats') {
      // Get category statistics
      const { data: stats, error } = await supabase
        .from('alimentos_v2')
        .select('categoria')
        .eq('ativo', true);
      
      if (error) throw error;
      
      const categoryCounts: Record<string, number> = {};
      stats?.forEach(item => {
        categoryCounts[item.categoria] = (categoryCounts[item.categoria] || 0) + 1;
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        stats: categoryCounts,
        total: stats?.length || 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reclassify') {
      // Fetch foods from "Outros" category that need reclassification
      const { data: foods, error: fetchError } = await supabase
        .from('alimentos_v2')
        .select('id, nome, categoria')
        .eq('categoria', 'Outros')
        .eq('ativo', true)
        .limit(batchSize);

      if (fetchError) throw fetchError;
      
      if (!foods || foods.length === 0) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Nenhum alimento para reclassificar',
          processed: 0 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[reclassify-foods] Processing ${foods.length} foods`);

      const results = foods.map(food => {
        const newCategory = classifyFood(food.nome);
        return {
          id: food.id,
          nome: food.nome,
          old_category: food.categoria,
          new_category: newCategory,
          descricao_curta: generateDescription(food.nome, newCategory),
          preparo_sugerido: getSuggestedPreparo(newCategory),
          changed: newCategory !== 'Outros'
        };
      });

      const changedFoods = results.filter(r => r.changed);
      
      console.log(`[reclassify-foods] ${changedFoods.length} foods will be reclassified`);

      if (!dryRun && changedFoods.length > 0) {
        // Update in batches
        for (const food of changedFoods) {
          const { error: updateError } = await supabase
            .from('alimentos_v2')
            .update({
              categoria: food.new_category,
              descricao_curta: food.descricao_curta,
              preparo_sugerido: food.preparo_sugerido,
              updated_at: new Date().toISOString()
            })
            .eq('id', food.id);

          if (updateError) {
            console.error(`[reclassify-foods] Error updating ${food.nome}:`, updateError);
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        processed: foods.length,
        changed: changedFoods.length,
        remainingInOutros: foods.length - changedFoods.length,
        dryRun,
        results: results.slice(0, 20) // Return first 20 for preview
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'enrich') {
      // Enrich foods that have no description
      const { data: foods, error: fetchError } = await supabase
        .from('alimentos_v2')
        .select('id, nome, categoria')
        .eq('ativo', true)
        .is('descricao_curta', null)
        .limit(batchSize);

      if (fetchError) throw fetchError;
      
      if (!foods || foods.length === 0) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Todos os alimentos já possuem descrição',
          processed: 0 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[reclassify-foods] Enriching ${foods.length} foods`);

      if (!dryRun) {
        for (const food of foods) {
          const { error: updateError } = await supabase
            .from('alimentos_v2')
            .update({
              descricao_curta: generateDescription(food.nome, food.categoria),
              preparo_sugerido: getSuggestedPreparo(food.categoria),
              updated_at: new Date().toISOString()
            })
            .eq('id', food.id);

          if (updateError) {
            console.error(`[reclassify-foods] Error enriching ${food.nome}:`, updateError);
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        processed: foods.length,
        dryRun
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action. Use: stats, reclassify, or enrich' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[reclassify-foods] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
