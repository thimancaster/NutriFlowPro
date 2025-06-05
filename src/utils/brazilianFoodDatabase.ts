
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
  // Café da Manhã
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
  
  // Almoço
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
    name: 'Peito de frango grelhado',
    category: 'proteina',
    mealTime: ['lunch', 'dinner'],
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    portion: '100g (1 filé)',
    commonUse: 'Proteína principal'
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
  
  // Lanches
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
    name: 'Castanha do Pará',
    category: 'gordura',
    mealTime: ['morning_snack', 'afternoon_snack'],
    calories: 187,
    protein: 4.1,
    carbs: 3.6,
    fats: 18.8,
    portion: '30g (3 unidades)',
    commonUse: 'Lanche nutritivo'
  },
  
  // Jantar
  {
    name: 'Sopa de legumes',
    category: 'vegetal',
    mealTime: ['dinner'],
    calories: 65,
    protein: 2.1,
    carbs: 12,
    fats: 1.2,
    portion: '250ml (1 prato)',
    commonUse: 'Jantar leve'
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
    commonUse: 'Alternativa ao frango'
  },
  
  // Ceia
  {
    name: 'Leite desnatado morno',
    category: 'proteina',
    mealTime: ['evening_snack'],
    calories: 35,
    protein: 3.4,
    carbs: 4.9,
    fats: 0.1,
    portion: '100ml (1/2 copo)',
    commonUse: 'Ceia relaxante'
  },
  {
    name: 'Maçã gala',
    category: 'fruta',
    mealTime: ['afternoon_snack', 'evening_snack'],
    calories: 63,
    protein: 0.3,
    carbs: 17,
    fats: 0.2,
    portion: '130g (1 unidade)',
    commonUse: 'Lanche noturno leve'
  }
];

// Função para obter sugestões específicas por refeição
export const getMealSuggestions = (mealType: string): string[] => {
  return brazilianFoodDatabase
    .filter(food => food.mealTime.includes(mealType))
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
