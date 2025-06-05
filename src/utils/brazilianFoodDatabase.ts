
export interface BrazilianFood {
  name: string;
  category: string;
  mealTime: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: string;
  portionSize: number;
  commonUse: string;
}

export const brazilianFoodDatabase: BrazilianFood[] = [
  // PROTEÍNAS - LATICÍNIOS
  {
    name: 'Iogurte Desnatado',
    category: 'proteina',
    mealTime: ['breakfast', 'morning_snack', 'afternoon_snack'],
    calories: 57,
    protein: 5.8,
    carbs: 7.8,
    fats: 0.0,
    portion: '1 pote (160g)',
    portionSize: 160,
    commonUse: 'Rico em probióticos, ideal para lanches'
  },
  {
    name: 'Iogurte Integral',
    category: 'proteina',
    mealTime: ['breakfast', 'morning_snack'],
    calories: 126,
    protein: 6.8,
    carbs: 9.1,
    fats: 7.0,
    portion: '1 pote (160g)',
    portionSize: 160,
    commonUse: 'Mais cremoso e saboroso'
  },
  {
    name: 'Leite Desnatado',
    category: 'proteina',
    mealTime: ['breakfast', 'evening_snack'],
    calories: 84,
    protein: 6.4,
    carbs: 9.3,
    fats: 2.4,
    portion: '1 copo (200ml)',
    portionSize: 200,
    commonUse: 'Base para vitaminas e café'
  },
  {
    name: 'Leite Integral',
    category: 'proteina',
    mealTime: ['breakfast', 'evening_snack'],
    calories: 124,
    protein: 6.2,
    carbs: 9.8,
    fats: 6.4,
    portion: '1 copo (200ml)',
    portionSize: 200,
    commonUse: 'Mais nutritivo e saboroso'
  },
  {
    name: 'Queijo Branco',
    category: 'proteina',
    mealTime: ['breakfast', 'morning_snack', 'afternoon_snack'],
    calories: 69.3,
    protein: 4.2,
    carbs: 0.8,
    fats: 5.4,
    portion: '1 fatia (30g)',
    portionSize: 30,
    commonUse: 'Acompanha pães e tapioca'
  },
  {
    name: 'Queijo Mussarela',
    category: 'proteina',
    mealTime: ['breakfast', 'afternoon_snack'],
    calories: 36.5,
    protein: 2.5,
    carbs: 0.2,
    fats: 2.8,
    portion: '1 fatia (13g)',
    portionSize: 13,
    commonUse: 'Para sanduíches e lanches'
  },
  {
    name: 'Requeijão Light',
    category: 'proteina',
    mealTime: ['breakfast', 'afternoon_snack'],
    calories: 43.2,
    protein: 2.9,
    carbs: 0.5,
    fats: 3.2,
    portion: '1 colher sobremesa (23g)',
    portionSize: 23,
    commonUse: 'Cremoso para pães'
  },
  {
    name: 'Requeijão Tradicional',
    category: 'proteina',
    mealTime: ['breakfast'],
    calories: 53.6,
    protein: 1.5,
    carbs: 1.5,
    fats: 3.8,
    portion: '1 colher sobremesa (23g)',
    portionSize: 23,
    commonUse: 'Sabor tradicional brasileiro'
  },

  // PROTEÍNAS - OVOS
  {
    name: 'Ovo inteiro',
    category: 'proteina',
    mealTime: ['breakfast', 'lunch', 'dinner'],
    calories: 74.5,
    protein: 6.2,
    carbs: 0.6,
    fats: 5.0,
    portion: '1 unidade (50g)',
    portionSize: 50,
    commonUse: 'Proteína completa e versátil'
  },
  {
    name: 'Clara de Ovo',
    category: 'proteina',
    mealTime: ['breakfast', 'morning_snack'],
    calories: 17,
    protein: 3.5,
    carbs: 0.3,
    fats: 0.0,
    portion: '1 unidade (34g)',
    portionSize: 34,
    commonUse: 'Proteína pura sem gordura'
  },

  // PROTEÍNAS - CARNES E AVES
  {
    name: 'Filé de Frango Grelhado',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 183.6,
    protein: 29.6,
    carbs: 0.3,
    fats: 6.2,
    portion: '1 bife médio (100g)',
    portionSize: 100,
    commonUse: 'Proteína magra principal'
  },
  {
    name: 'Sobrecoxa de frango assada',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 154.5,
    protein: 15.6,
    carbs: 0.2,
    fats: 9.6,
    portion: '1 unidade média (65g)',
    portionSize: 65,
    commonUse: 'Mais saborosa que o peito'
  },
  {
    name: 'Coxa de frango assada',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 129,
    protein: 13.0,
    carbs: 0.3,
    fats: 8.0,
    portion: '1 unidade média (55g)',
    portionSize: 55,
    commonUse: 'Opção econômica e saborosa'
  },
  {
    name: 'Frango desfiado cozido',
    category: 'proteina',
    mealTime: ['lunch', 'dinner', 'afternoon_snack'],
    calories: 29.4,
    protein: 5.5,
    carbs: 0.0,
    fats: 0.6,
    portion: '1 colher sopa (18g)',
    portionSize: 18,
    commonUse: 'Para sanduíches e saladas'
  },
  {
    name: 'Patinho bife grelhado',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 219,
    protein: 35.9,
    carbs: 0.0,
    fats: 7.3,
    portion: '1 bife médio (100g)',
    portionSize: 100,
    commonUse: 'Carne magra e saborosa'
  },
  {
    name: 'Patinho carne moída',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 73.2,
    protein: 6.0,
    carbs: 0.2,
    fats: 5.2,
    portion: '1 colher sopa (25g)',
    portionSize: 25,
    commonUse: 'Versátil para pratos variados'
  },
  {
    name: 'Filé Mignon Grelhado',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 219.7,
    protein: 32.8,
    carbs: 0.0,
    fats: 8.8,
    portion: '1 bife médio (100g)',
    portionSize: 100,
    commonUse: 'Corte nobre e macio'
  },
  {
    name: 'Músculo Cozido',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 85.4,
    protein: 11.0,
    carbs: 0.0,
    fats: 4.2,
    portion: '1 pedaço médio (35g)',
    portionSize: 35,
    commonUse: 'Rico em colágeno'
  },
  {
    name: 'Peito de peru',
    category: 'proteina',
    mealTime: ['breakfast', 'afternoon_snack', 'dinner'],
    calories: 16.8,
    protein: 3.8,
    carbs: 0.0,
    fats: 0.1,
    portion: '1 fatia (16g)',
    portionSize: 16,
    commonUse: 'Proteína magra para lanches'
  },
  {
    name: 'Presunto',
    category: 'proteina',
    mealTime: ['breakfast', 'afternoon_snack'],
    calories: 33.9,
    protein: 3.0,
    carbs: 0.0,
    fats: 2.2,
    portion: '1 fatia (15g)',
    portionSize: 15,
    commonUse: 'Clássico para sanduíches'
  },

  // PROTEÍNAS - PEIXES
  {
    name: 'Peixe Tilápia Grelhada',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 122,
    protein: 21.0,
    carbs: 0.0,
    fats: 4.2,
    portion: '1 bife médio (120g)',
    portionSize: 120,
    commonUse: 'Peixe de água doce popular'
  },
  {
    name: 'Salmão Grelhado',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 242.7,
    protein: 26.1,
    carbs: 0.0,
    fats: 14.5,
    portion: '1 bife (100g)',
    portionSize: 100,
    commonUse: 'Rico em ômega 3'
  },
  {
    name: 'Atum',
    category: 'proteina',
    mealTime: ['lunch', 'afternoon_snack'],
    calories: 46.2,
    protein: 10.3,
    carbs: 0.6,
    fats: 0.2,
    portion: '1 colher sopa (40g)',
    portionSize: 40,
    commonUse: 'Prático para saladas'
  },
  {
    name: 'Sardinha em óleo',
    category: 'proteina',
    mealTime: ['lunch', 'afternoon_snack'],
    calories: 36,
    protein: 4.3,
    carbs: 0.3,
    fats: 1.0,
    portion: '1 colher sopa (20g)',
    portionSize: 20,
    commonUse: 'Rica em cálcio'
  },

  // CARBOIDRATOS - GRÃOS E CEREAIS
  {
    name: 'Feijão',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 52.4,
    protein: 2.8,
    carbs: 7.1,
    fats: 1.3,
    portion: '1 concha (86g)',
    portionSize: 86,
    commonUse: 'Base da alimentação brasileira'
  },
  {
    name: 'Arroz Branco',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 105.9,
    protein: 1.9,
    carbs: 21.6,
    fats: 1.0,
    portion: '1 escumadeira média (85g)',
    portionSize: 85,
    commonUse: 'Acompanhamento clássico'
  },
  {
    name: 'Arroz Integral',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 45.2,
    protein: 0.8,
    carbs: 8.6,
    fats: 0.7,
    portion: '1 escumadeira média (59g)',
    portionSize: 59,
    commonUse: 'Versão mais nutritiva'
  },
  {
    name: 'Aveia em flocos',
    category: 'carboidrato',
    mealTime: ['breakfast'],
    calories: 57,
    protein: 2.3,
    carbs: 9.8,
    fats: 1.3,
    portion: '1 colher sopa (15g)',
    portionSize: 15,
    commonUse: 'Para vitaminas e mingaus'
  },
  {
    name: 'Farelo de aveia',
    category: 'carboidrato',
    mealTime: ['breakfast'],
    calories: 34,
    protein: 1.8,
    carbs: 4.2,
    fats: 1.1,
    portion: '1 colher sopa (10g)',
    portionSize: 10,
    commonUse: 'Rico em fibras'
  },

  // CARBOIDRATOS - TUBÉRCULOS
  {
    name: 'Batata Inglesa',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 36.1,
    protein: 0.8,
    carbs: 8.3,
    fats: 0.0,
    portion: '1 unidade (70g)',
    portionSize: 70,
    commonUse: 'Versátil para acompanhamentos'
  },
  {
    name: 'Batata Doce',
    category: 'carboidrato',
    mealTime: ['lunch', 'afternoon_snack'],
    calories: 42,
    protein: 0.6,
    carbs: 9.7,
    fats: 0.1,
    portion: 'fatia pequena (40g)',
    portionSize: 40,
    commonUse: 'Carboidrato de baixo índice glicêmico'
  },
  {
    name: 'Mandioca',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 125,
    protein: 0.6,
    carbs: 30.1,
    fats: 0.3,
    portion: '1 pedaço (100g)',
    portionSize: 100,
    commonUse: 'Tradicional da culinária brasileira'
  },
  {
    name: 'Mandioquinha',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 38,
    protein: 0.6,
    carbs: 8.8,
    fats: 0.0,
    portion: '1 pedaço (50g)',
    portionSize: 50,
    commonUse: 'Sabor suave e nutritiva'
  },

  // CARBOIDRATOS - MASSAS E PÃES
  {
    name: 'Macarrão',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 284,
    protein: 8.8,
    carbs: 59.0,
    fats: 1.4,
    portion: 'escumadeira (80g)',
    portionSize: 80,
    commonUse: 'Base para diversos pratos'
  },
  {
    name: 'Macarrão Integral',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 271,
    protein: 10.0,
    carbs: 56.0,
    fats: 0.8,
    portion: 'escumadeira (80g)',
    portionSize: 80,
    commonUse: 'Versão mais nutritiva'
  },
  {
    name: 'Pão Integral',
    category: 'carboidrato',
    mealTime: ['breakfast', 'afternoon_snack'],
    calories: 61,
    protein: 3.4,
    carbs: 9.0,
    fats: 1.3,
    portion: '1 fatia (25g)',
    portionSize: 25,
    commonUse: 'Rico em fibras'
  },
  {
    name: 'Pão Francês',
    category: 'carboidrato',
    mealTime: ['breakfast', 'afternoon_snack'],
    calories: 150,
    protein: 4.9,
    carbs: 30.8,
    fats: 1.1,
    portion: '1 unidade (50g)',
    portionSize: 50,
    commonUse: 'Clássico do café da manhã'
  },
  {
    name: 'Pão de Queijo',
    category: 'carboidrato',
    mealTime: ['breakfast', 'afternoon_snack'],
    calories: 94.3,
    protein: 2.9,
    carbs: 10.5,
    fats: 4.5,
    portion: '1 unidade (33g)',
    portionSize: 33,
    commonUse: 'Típico de Minas Gerais'
  },
  {
    name: 'Goma de Tapioca',
    category: 'carboidrato',
    mealTime: ['breakfast', 'afternoon_snack'],
    calories: 43,
    protein: 0.0,
    carbs: 10.8,
    fats: 0.1,
    portion: '1 colher sopa (15g)',
    portionSize: 15,
    commonUse: 'Para tapioca regional'
  },
  {
    name: 'Torrada integral',
    category: 'carboidrato',
    mealTime: ['breakfast', 'evening_snack'],
    calories: 36.6,
    protein: 1.3,
    carbs: 7.3,
    fats: 0.3,
    portion: '1 unidade (10g)',
    portionSize: 10,
    commonUse: 'Lanche leve e crocante'
  },

  // FRUTAS
  {
    name: 'Morango',
    category: 'fruta',
    mealTime: ['breakfast', 'morning_snack', 'afternoon_snack'],
    calories: 3.6,
    protein: 0.0,
    carbs: 0.8,
    fats: 0.0,
    portion: '1 unidade (12g)',
    portionSize: 12,
    commonUse: 'Rico em vitamina C'
  },
  {
    name: 'Melancia',
    category: 'fruta',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 32,
    protein: 0.6,
    carbs: 7.1,
    fats: 0.4,
    portion: '1 fatia (100g)',
    portionSize: 100,
    commonUse: 'Hidratante e refrescante'
  },
  {
    name: 'Melão',
    category: 'fruta',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 22.5,
    protein: 0.4,
    carbs: 5.5,
    fats: 0.0,
    portion: '1 fatia média (90g)',
    portionSize: 90,
    commonUse: 'Doce e hidratante'
  },
  {
    name: 'Maçã',
    category: 'fruta',
    mealTime: ['morning_snack', 'afternoon_snack', 'evening_snack'],
    calories: 78,
    protein: 0.3,
    carbs: 20.7,
    fats: 0.2,
    portion: '1 unidade (150g)',
    portionSize: 150,
    commonUse: 'Rica em fibras'
  },
  {
    name: 'Banana',
    category: 'fruta',
    mealTime: ['breakfast', 'morning_snack', 'afternoon_snack'],
    calories: 69,
    protein: 0.7,
    carbs: 17.5,
    fats: 0.3,
    portion: '1 unidade (75g)',
    portionSize: 75,
    commonUse: 'Rica em potássio'
  },
  {
    name: 'Mamão papaia',
    category: 'fruta',
    mealTime: ['breakfast', 'morning_snack'],
    calories: 39,
    protein: 0.6,
    carbs: 9.8,
    fats: 0.1,
    portion: '1 fatia pequena (100g)',
    portionSize: 100,
    commonUse: 'Digestivo e nutritivo'
  },
  {
    name: 'Mamão formosa',
    category: 'fruta',
    mealTime: ['breakfast', 'morning_snack'],
    calories: 32,
    protein: 0.5,
    carbs: 8.3,
    fats: 0.1,
    portion: '1 fatia pequena (100g)',
    portionSize: 100,
    commonUse: 'Suave e digestivo'
  },
  {
    name: 'Abacaxi',
    category: 'fruta',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 36.7,
    protein: 0.2,
    carbs: 9.3,
    fats: 0.3,
    portion: '1 fatia média (75g)',
    portionSize: 75,
    commonUse: 'Rico em enzimas digestivas'
  },
  {
    name: 'Laranja',
    category: 'fruta',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 42.3,
    protein: 0.8,
    carbs: 10.6,
    fats: 0.1,
    portion: '1 unidade (90g)',
    portionSize: 90,
    commonUse: 'Rica em vitamina C'
  },
  {
    name: 'Abacate',
    category: 'fruta',
    mealTime: ['afternoon_snack'],
    calories: 32.2,
    protein: 0.4,
    carbs: 1.4,
    fats: 3.0,
    portion: '1 colher sopa amassado (20g)',
    portionSize: 20,
    commonUse: 'Rico em gorduras boas'
  },

  // GORDURAS - ÓLEOS E OLEAGINOSAS
  {
    name: 'Azeite de oliva extravirgem',
    category: 'gordura',
    mealTime: ['lunch', 'dinner'],
    calories: 18,
    protein: 0.0,
    carbs: 0.0,
    fats: 2.0,
    portion: '1 colher chá rasa (2g)',
    portionSize: 2,
    commonUse: 'Para temperos e finalização'
  },
  {
    name: 'Castanha de caju',
    category: 'gordura',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 15,
    protein: 0.5,
    carbs: 0.8,
    fats: 1.1,
    portion: '1 unidade (2,5g)',
    portionSize: 2.5,
    commonUse: 'Lanche nutritivo'
  },
  {
    name: 'Castanha do Pará',
    category: 'gordura',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 27,
    protein: 0.6,
    carbs: 0.6,
    fats: 0.5,
    portion: '1 unidade (4g)',
    portionSize: 4,
    commonUse: 'Rica em selênio'
  },
  {
    name: 'Noz',
    category: 'gordura',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 32,
    protein: 0.7,
    carbs: 0.9,
    fats: 3.0,
    portion: '1 unidade (5g)',
    portionSize: 5,
    commonUse: 'Rica em ômega 3'
  },
  {
    name: 'Amendoim',
    category: 'gordura',
    mealTime: ['afternoon_snack'],
    calories: 112,
    protein: 4.8,
    carbs: 3.9,
    fats: 8.8,
    portion: '1 colher sopa cheia (19g)',
    portionSize: 19,
    commonUse: 'Rico em proteína vegetal'
  },
  {
    name: 'Amêndoa',
    category: 'gordura',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 6,
    protein: 0.2,
    carbs: 0.2,
    fats: 0.5,
    portion: '1 unidade (1g)',
    portionSize: 1,
    commonUse: 'Rica em vitamina E'
  },
  {
    name: 'Pasta de amendoim',
    category: 'gordura',
    mealTime: ['breakfast', 'afternoon_snack'],
    calories: 94,
    protein: 3.8,
    carbs: 3.6,
    fats: 7.9,
    portion: '1 colher sopa (16g)',
    portionSize: 16,
    commonUse: 'Para pães e vitaminas'
  },

  // VEGETAIS E LEGUMES
  {
    name: 'Shitake',
    category: 'vegetal',
    mealTime: ['lunch', 'dinner'],
    calories: 34.5,
    protein: 3.1,
    carbs: 4.4,
    fats: 0.5,
    portion: '100g',
    portionSize: 100,
    commonUse: 'Cogumelo saboroso e nutritivo'
  },
  {
    name: 'Shimeje',
    category: 'vegetal',
    mealTime: ['lunch', 'dinner'],
    calories: 16.8,
    protein: 2.5,
    carbs: 1.7,
    fats: 0.0,
    portion: '100g',
    portionSize: 100,
    commonUse: 'Cogumelo delicado'
  },
  {
    name: 'Ervilha',
    category: 'vegetal',
    mealTime: ['lunch', 'dinner'],
    calories: 10.5,
    protein: 0.7,
    carbs: 1.8,
    fats: 0.0,
    portion: '1 colher sopa (13g)',
    portionSize: 13,
    commonUse: 'Rica em fibras'
  },
  {
    name: 'Soja',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 41.5,
    protein: 3.9,
    carbs: 2.3,
    fats: 2.1,
    portion: '1 colher sopa (24g)',
    portionSize: 24,
    commonUse: 'Proteína vegetal completa'
  },
  {
    name: 'Grão de bico',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 39.3,
    protein: 2.1,
    carbs: 6.5,
    fats: 0.6,
    portion: '1 colher sopa (24g)',
    portionSize: 24,
    commonUse: 'Rico em fibras e proteína'
  },

  // SUCOS E BEBIDAS
  {
    name: 'Suco de laranja',
    category: 'bebida',
    mealTime: ['breakfast', 'morning_snack'],
    calories: 83.6,
    protein: 1.1,
    carbs: 19.6,
    fats: 0.2,
    portion: '1 copo médio (200ml)',
    portionSize: 200,
    commonUse: 'Rico em vitamina C'
  },
  {
    name: 'Suco de uva integral',
    category: 'bebida',
    mealTime: ['afternoon_snack'],
    calories: 123.2,
    protein: 0.6,
    carbs: 30.2,
    fats: 0.0,
    portion: '1 copo médio (200ml)',
    portionSize: 200,
    commonUse: 'Rico em antioxidantes'
  }
];

// Função para obter sugestões específicas por refeição sem repetição
export const getMealSuggestions = (mealType: string): string[] => {
  const foodsForMeal = brazilianFoodDatabase.filter(food => food.mealTime.includes(mealType));
  
  // Criar categorias balanceadas para cada refeição
  const categorizedSuggestions: Record<string, string[]> = {
    breakfast: [
      'Pão Francês com Requeijão Light',
      'Ovo inteiro mexido com torrada',
      'Mamão papaia com granola',
      'Iogurte Integral com morango',
      'Tapioca com queijo branco',
      'Aveia com banana amassada',
      'Leite Integral com café',
      'Pão integral com pasta de amendoim'
    ],
    morning_snack: [
      'Banana com castanhas',
      'Iogurte Desnatado natural',
      'Maçã com amêndoas',
      'Mamão formosa pequeno',
      'Mix de oleaginosas',
      'Morango com iogurte',
      'Melão em fatias',
      'Água de coco natural'
    ],
    lunch: [
      'Arroz Integral com feijão',
      'Filé de Frango Grelhado',
      'Batata doce assada',
      'Tilápia grelhada com legumes',
      'Macarrão integral com molho',
      'Patinho grelhado com batata',
      'Salmão com quinoa',
      'Mandioca com carne moída'
    ],
    afternoon_snack: [
      'Pão integral com peito de peru',
      'Batata doce pequena assada',
      'Queijo branco com biscoito',
      'Laranja com castanha de caju',
      'Abacaxi em fatias',
      'Pão de queijo pequeno',
      'Uva com amendoim',
      'Suco natural de frutas'
    ],
    dinner: [
      'Omelete com legumes',
      'Sopa de legumes variados',
      'Peito de peru com salada',
      'Tilápia com batata inglesa',
      'Frango desfiado com arroz',
      'Salmão com brócolis',
      'Músculo cozido com mandioquinha',
      'Ovos com torrada integral'
    ],
    evening_snack: [
      'Leite morno com canela',
      'Torrada integral light',
      'Maçã pequena assada',
      'Iogurte desnatado',
      'Chá de ervas relaxante',
      'Biscoito integral simples',
      'Clara de ovo batida',
      'Agua com limão'
    ]
  };

  return categorizedSuggestions[mealType] || [];
};

// Função para buscar alimentos por categoria
export const getFoodsByCategory = (category: string): BrazilianFood[] => {
  return brazilianFoodDatabase.filter(food => food.category === category);
};

// Função para calcular valores nutricionais de uma porção
export const calculateNutrition = (food: BrazilianFood, multiplier: number = 1) => {
  return {
    calories: food.calories * multiplier,
    protein: food.protein * multiplier,
    carbs: food.carbs * multiplier,
    fats: food.fats * multiplier
  };
};

// Função para obter alimentos balanceados para cada refeição
export const getBalancedFoodsForMeal = (mealType: string): BrazilianFood[] => {
  const availableFoods = brazilianFoodDatabase.filter(food => food.mealTime.includes(mealType));
  
  // Distribuir por categorias para variedade
  const categoryCounts: Record<string, number> = {};
  const selectedFoods: BrazilianFood[] = [];
  
  // Limite por categoria para evitar repetição
  const maxPerCategory = 2;
  
  for (const food of availableFoods) {
    if (!categoryCounts[food.category]) {
      categoryCounts[food.category] = 0;
    }
    
    if (categoryCounts[food.category] < maxPerCategory) {
      selectedFoods.push(food);
      categoryCounts[food.category]++;
    }
  }
  
  return selectedFoods.slice(0, 6); // Limitar a 6 para não sobrecarregar
};
