
export interface BrazilianFood {
  name: string;
  category: string;
  mealTime: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: string;
  commonUse: string;
}

export const brazilianFoodDatabase: BrazilianFood[] = [
  // Café da Manhã - Diversificado
  {
    name: 'Pão francês integral',
    category: 'carboidrato',
    mealTime: ['breakfast'],
    calories: 135,
    protein: 4.5,
    carbs: 26,
    fats: 1.2,
    portion: '50g (1 unidade)',
    commonUse: 'Base do café da manhã brasileiro'
  },
  {
    name: 'Pão de forma integral',
    category: 'carboidrato',
    mealTime: ['breakfast'],
    calories: 69,
    protein: 3.1,
    carbs: 12.5,
    fats: 1.1,
    portion: '25g (1 fatia)',
    commonUse: 'Alternativa para sanduíches'
  },
  {
    name: 'Tapioca',
    category: 'carboidrato',
    mealTime: ['breakfast', 'afternoon_snack'],
    calories: 98,
    protein: 0.2,
    carbs: 25,
    fats: 0.1,
    portion: '30g (1 unidade média)',
    commonUse: 'Típico do nordeste brasileiro'
  },
  {
    name: 'Queijo minas frescal',
    category: 'proteina',
    mealTime: ['breakfast', 'morning_snack'],
    calories: 75,
    protein: 11,
    carbs: 1.5,
    fats: 2.8,
    portion: '30g (1 fatia)',
    commonUse: 'Acompanha pães e tapioca'
  },
  {
    name: 'Requeijão light',
    category: 'proteina',
    mealTime: ['breakfast'],
    calories: 54,
    protein: 3.2,
    carbs: 2.1,
    fats: 4.1,
    portion: '20g (1 colher de sopa)',
    commonUse: 'Cremoso para pães'
  },
  {
    name: 'Ovo cozido',
    category: 'proteina',
    mealTime: ['breakfast', 'morning_snack'],
    calories: 78,
    protein: 6.3,
    carbs: 0.6,
    fats: 5.3,
    portion: '50g (1 unidade)',
    commonUse: 'Proteína completa'
  },
  {
    name: 'Ovo mexido',
    category: 'proteina',
    mealTime: ['breakfast'],
    calories: 91,
    protein: 6.5,
    carbs: 0.7,
    fats: 7.2,
    portion: '60g (1 ovo preparado)',
    commonUse: 'Preparo tradicional'
  },
  {
    name: 'Aveia em flocos',
    category: 'carboidrato',
    mealTime: ['breakfast'],
    calories: 68,
    protein: 2.4,
    carbs: 12,
    fats: 1.4,
    portion: '20g (2 colheres de sopa)',
    commonUse: 'Vitaminas e mingaus'
  },
  {
    name: 'Granola caseira',
    category: 'carboidrato',
    mealTime: ['breakfast'],
    calories: 89,
    protein: 2.8,
    carbs: 14,
    fats: 3.2,
    portion: '20g (2 colheres de sopa)',
    commonUse: 'Acompanha iogurtes'
  },
  {
    name: 'Banana prata',
    category: 'fruta',
    mealTime: ['breakfast', 'morning_snack', 'afternoon_snack'],
    calories: 98,
    protein: 1.3,
    carbs: 26,
    fats: 0.1,
    portion: '86g (1 unidade média)',
    commonUse: 'Vitaminas e lanches'
  },
  {
    name: 'Mamão papaya',
    category: 'fruta',
    mealTime: ['breakfast'],
    calories: 43,
    protein: 0.5,
    carbs: 11,
    fats: 0.1,
    portion: '100g (1 fatia média)',
    commonUse: 'Digestivo matinal'
  },
  {
    name: 'Café com leite',
    category: 'bebida',
    mealTime: ['breakfast'],
    calories: 42,
    protein: 2.1,
    carbs: 4.8,
    fats: 1.6,
    portion: '100ml (1/2 xícara)',
    commonUse: 'Bebida tradicional'
  },
  
  // Lanche da Manhã - Variado
  {
    name: 'Iogurte natural desnatado',
    category: 'proteina',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 51,
    protein: 4.3,
    carbs: 6.6,
    fats: 0.2,
    portion: '100g (1 pote pequeno)',
    commonUse: 'Lanches saudáveis'
  },
  {
    name: 'Iogurte grego',
    category: 'proteina',
    mealTime: ['morning_snack'],
    calories: 97,
    protein: 9.0,
    carbs: 3.6,
    fats: 5.0,
    portion: '100g (1 pote)',
    commonUse: 'Rico em proteínas'
  },
  {
    name: 'Castanha do Pará',
    category: 'gordura',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 187,
    protein: 4.1,
    carbs: 3.6,
    fats: 18.8,
    portion: '30g (3 unidades)',
    commonUse: 'Fonte de selênio'
  },
  {
    name: 'Amêndoas',
    category: 'gordura',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 164,
    protein: 6.0,
    carbs: 6.1,
    fats: 14.2,
    portion: '30g (23 unidades)',
    commonUse: 'Lanche nutritivo'
  },
  {
    name: 'Maçã gala',
    category: 'fruta',
    mealTime: ['morning_snack', 'afternoon_snack', 'evening_snack'],
    calories: 63,
    protein: 0.3,
    carbs: 17,
    fats: 0.2,
    portion: '130g (1 unidade)',
    commonUse: 'Fruta prática'
  },
  {
    name: 'Pera williams',
    category: 'fruta',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 57,
    protein: 0.4,
    carbs: 15,
    fats: 0.1,
    portion: '100g (1 unidade)',
    commonUse: 'Rica em fibras'
  },
  
  // Almoço - Completo e variado
  {
    name: 'Arroz branco cozido',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 128,
    protein: 2.6,
    carbs: 28,
    fats: 0.2,
    portion: '100g (4 colheres de sopa)',
    commonUse: 'Base da refeição brasileira'
  },
  {
    name: 'Arroz integral cozido',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 111,
    protein: 2.3,
    carbs: 23,
    fats: 0.9,
    portion: '100g (4 colheres de sopa)',
    commonUse: 'Versão mais nutritiva'
  },
  {
    name: 'Feijão carioca cozido',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 76,
    protein: 4.8,
    carbs: 13.6,
    fats: 0.5,
    portion: '86g (1 concha)',
    commonUse: 'Dupla clássica com arroz'
  },
  {
    name: 'Feijão preto cozido',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 77,
    protein: 4.5,
    carbs: 14,
    fats: 0.5,
    portion: '86g (1 concha)',
    commonUse: 'Típico do Rio de Janeiro'
  },
  {
    name: 'Peito de frango grelhado',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    portion: '100g (1 filé)',
    commonUse: 'Proteína magra principal'
  },
  {
    name: 'Coxão mole grelhado',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 171,
    protein: 30,
    carbs: 0,
    fats: 5.1,
    portion: '100g (1 bife)',
    commonUse: 'Carne bovina magra'
  },
  {
    name: 'Peixe tilápia grelhado',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 129,
    protein: 26,
    carbs: 0,
    fats: 2.7,
    portion: '100g (1 filé)',
    commonUse: 'Peixe de água doce'
  },
  {
    name: 'Salmão grelhado',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 208,
    protein: 25,
    carbs: 0,
    fats: 12,
    portion: '100g (1 filé)',
    commonUse: 'Rico em ômega 3'
  },
  {
    name: 'Alface americana',
    category: 'vegetal',
    mealTime: ['lunch', 'dinner'],
    calories: 11,
    protein: 1.4,
    carbs: 1.7,
    fats: 0.2,
    portion: '80g (2 xícaras)',
    commonUse: 'Base de saladas'
  },
  {
    name: 'Tomate salada',
    category: 'vegetal',
    mealTime: ['lunch', 'dinner'],
    calories: 15,
    protein: 1.1,
    carbs: 2.9,
    fats: 0.2,
    portion: '80g (1 tomate médio)',
    commonUse: 'Complemento de saladas'
  },
  {
    name: 'Cenoura refogada',
    category: 'vegetal',
    mealTime: ['lunch', 'dinner'],
    calories: 35,
    protein: 0.9,
    carbs: 8.2,
    fats: 0.2,
    portion: '100g (1 porção)',
    commonUse: 'Legume doce e nutritivo'
  },
  {
    name: 'Brócolis refogado',
    category: 'vegetal',
    mealTime: ['lunch', 'dinner'],
    calories: 25,
    protein: 3.0,
    carbs: 5.0,
    fats: 0.4,
    portion: '100g (3 floretes)',
    commonUse: 'Rico em vitaminas'
  },
  {
    name: 'Batata doce cozida',
    category: 'carboidrato',
    mealTime: ['lunch', 'afternoon_snack'],
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fats: 0.1,
    portion: '100g (1 unidade pequena)',
    commonUse: 'Carboidrato complexo'
  },
  
  // Lanche da Tarde - Leves e nutritivos
  {
    name: 'Biscoito integral',
    category: 'carboidrato',
    mealTime: ['afternoon_snack'],
    calories: 45,
    protein: 1.2,
    carbs: 7.8,
    fats: 1.2,
    portion: '10g (2 unidades)',
    commonUse: 'Lanche prático'
  },
  {
    name: 'Vitamina de frutas',
    category: 'bebida',
    mealTime: ['afternoon_snack'],
    calories: 89,
    protein: 3.2,
    carbs: 18,
    fats: 0.8,
    portion: '200ml (1 copo)',
    commonUse: 'Refrescante e nutritivo'
  },
  {
    name: 'Sanduíche natural',
    category: 'misto',
    mealTime: ['afternoon_snack'],
    calories: 156,
    protein: 8.2,
    carbs: 18,
    fats: 6.1,
    portion: '80g (1/2 sanduíche)',
    commonUse: 'Lanche equilibrado'
  },
  {
    name: 'Água de coco',
    category: 'bebida',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 19,
    protein: 0.7,
    carbs: 3.7,
    fats: 0.2,
    portion: '100ml (1/2 copo)',
    commonUse: 'Hidratante natural'
  },
  
  // Jantar - Leve e digestivo
  {
    name: 'Sopa de legumes',
    category: 'vegetal',
    mealTime: ['dinner'],
    calories: 65,
    protein: 2.1,
    carbs: 12,
    fats: 1.2,
    portion: '250ml (1 prato)',
    commonUse: 'Jantar leve e nutritivo'
  },
  {
    name: 'Salada completa',
    category: 'vegetal',
    mealTime: ['dinner'],
    calories: 78,
    protein: 3.2,
    carbs: 12,
    fats: 2.8,
    portion: '150g (1 prato)',
    commonUse: 'Mix de vegetais frescos'
  },
  {
    name: 'Omelete simples',
    category: 'proteina',
    mealTime: ['dinner'],
    calories: 154,
    protein: 11,
    carbs: 1.1,
    fats: 11.5,
    portion: '100g (2 ovos)',
    commonUse: 'Proteína leve para jantar'
  },
  {
    name: 'Peito de peru',
    category: 'proteina',
    mealTime: ['dinner'],
    calories: 104,
    protein: 23,
    carbs: 0,
    fats: 1.2,
    portion: '100g (3 fatias)',
    commonUse: 'Proteína magra'
  },
  {
    name: 'Quinoa cozida',
    category: 'carboidrato',
    mealTime: ['lunch', 'dinner'],
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fats: 1.9,
    portion: '100g (4 colheres de sopa)',
    commonUse: 'Pseudocereal nutritivo'
  },
  
  // Ceia - Leve e relaxante
  {
    name: 'Leite desnatado morno',
    category: 'proteina',
    mealTime: ['evening_snack'],
    calories: 35,
    protein: 3.4,
    carbs: 4.9,
    fats: 0.1,
    portion: '100ml (1/2 copo)',
    commonUse: 'Relaxante para dormir'
  },
  {
    name: 'Chá de camomila',
    category: 'bebida',
    mealTime: ['evening_snack'],
    calories: 2,
    protein: 0,
    carbs: 0.4,
    fats: 0,
    portion: '200ml (1 xícara)',
    commonUse: 'Calmante natural'
  },
  {
    name: 'Torrada integral',
    category: 'carboidrato',
    mealTime: ['evening_snack'],
    calories: 62,
    protein: 2.4,
    carbs: 12,
    fats: 0.9,
    portion: '20g (1 fatia)',
    commonUse: 'Lanche leve noturno'
  },
  {
    name: 'Geleia diet',
    category: 'doce',
    mealTime: ['evening_snack'],
    calories: 8,
    protein: 0.1,
    carbs: 2.1,
    fats: 0,
    portion: '10g (1 colher de chá)',
    commonUse: 'Complemento doce sem açúcar'
  }
];

// Função para obter sugestões específicas por refeição com maior variedade
export const getMealSuggestions = (mealType: string): string[] => {
  const foodsForMeal = brazilianFoodDatabase.filter(food => food.mealTime.includes(mealType));
  
  // Embaralhar a lista para dar variedade
  const shuffled = foodsForMeal.sort(() => 0.5 - Math.random());
  
  return shuffled
    .map(food => `${food.name} (${food.portion})`)
    .slice(0, 8); // Limitar a 8 sugestões
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

// Função para obter alimentos aleatórios para evitar repetição
export const getRandomFoodsForMeal = (mealType: string, count: number = 3): BrazilianFood[] => {
  const availableFoods = brazilianFoodDatabase.filter(food => food.mealTime.includes(mealType));
  const shuffled = availableFoods.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
