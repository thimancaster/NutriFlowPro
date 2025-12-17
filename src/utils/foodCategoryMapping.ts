/**
 * FOOD CATEGORY MAPPING
 * Rules for automatic food reclassification based on keywords
 */

export const CATEGORY_RULES: Record<string, string[]> = {
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
    'semente', 'chia', 'linhaça', 'gergelim', 'girassol', 'abóbora'
  ],
  'Ovos': [
    'ovo', 'clara', 'gema', 'omelete', 'ovo cozido', 'ovo frito',
    'ovo pochê', 'ovos mexidos'
  ],
  'Embutidos': [
    'salsicha', 'calabresa', 'paio', 'chorizo', 'hot dog', 'peito de peru',
    'blanquet', 'apresuntado', 'copa lombo'
  ],
};

/**
 * Description templates by category
 */
export const DESCRIPTION_TEMPLATES: Record<string, (nome: string) => string> = {
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

/**
 * Preparation suggestions by category
 */
export const PREPARO_TEMPLATES: Record<string, string[]> = {
  'Peixes e Frutos do Mar': ['Grelhado', 'Assado', 'Cozido no vapor', 'Cru (sashimi)'],
  'Carnes Bovinas': ['Grelhado', 'Assado', 'Ensopado', 'Na chapa'],
  'Carnes Suínas': ['Assado', 'Grelhado', 'Frito', 'Na brasa'],
  'Aves': ['Grelhado', 'Assado', 'Cozido', 'Desfiado'],
  'Cereais e Grãos': ['Cozido', 'Em mingau', 'Com leite'],
  'Massas': ['Cozida al dente', 'Com molho', 'Gratinada'],
  'Leguminosas': ['Cozido', 'Em sopa', 'Refogado'],
  'Frutas': ['In natura', 'Em suco', 'Em salada de frutas'],
  'Verduras e Legumes': ['Cru', 'Refogado', 'Cozido', 'No vapor'],
  'Tubérculos': ['Cozido', 'Assado', 'Em purê', 'Frito'],
  'Laticínios': ['Puro', 'Em preparações'],
  'Óleos e Gorduras': ['Para temperar', 'Para cozinhar'],
  'Bebidas': ['Gelado', 'Quente'],
  'Lanches e Salgados': ['Assado', 'Frito'],
  'Pães e Padaria': ['Puro', 'Com recheio', 'Torrado'],
  'Molhos e Condimentos': ['Como acompanhamento'],
  'Doces e Sobremesas': ['Servir gelado', 'Em temperatura ambiente'],
  'Castanhas e Sementes': ['Torradas', 'In natura', 'Trituradas'],
  'Ovos': ['Cozido', 'Frito', 'Mexido', 'Omelete'],
  'Embutidos': ['Grelhado', 'Frito', 'Em preparações'],
  'Outros': ['Conforme indicação'],
};

/**
 * Classify a food name into a category based on keywords
 */
export function classifyFood(foodName: string): string {
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

/**
 * Generate description for a food based on its category
 */
export function generateDescription(foodName: string, category: string): string {
  const template = DESCRIPTION_TEMPLATES[category] || DESCRIPTION_TEMPLATES['Outros'];
  return template(foodName);
}

/**
 * Get suggested preparation for a food based on its category
 */
export function getSuggestedPreparo(category: string): string {
  const preparos = PREPARO_TEMPLATES[category] || PREPARO_TEMPLATES['Outros'];
  return preparos[0]; // Return primary suggestion
}

/**
 * Process a batch of foods for reclassification
 */
export interface FoodReclassificationResult {
  id: string;
  nome: string;
  old_category: string;
  new_category: string;
  descricao_curta: string;
  preparo_sugerido: string;
}

export function processFoodForReclassification(
  food: { id: string; nome: string; categoria: string }
): FoodReclassificationResult {
  const newCategory = classifyFood(food.nome);
  const description = generateDescription(food.nome, newCategory);
  const preparo = getSuggestedPreparo(newCategory);
  
  return {
    id: food.id,
    nome: food.nome,
    old_category: food.categoria,
    new_category: newCategory,
    descricao_curta: description,
    preparo_sugerido: preparo,
  };
}
