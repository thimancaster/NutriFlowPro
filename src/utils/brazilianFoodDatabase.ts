
// Banco de dados de sugestões de alimentos brasileiros organizados por refeição
export const getMealSuggestions = (mealType: string): string[] => {
  const suggestions: Record<string, string[]> = {
    'cafe_da_manha': [
      'Pão francês', 'Café com leite', 'Frutas', 'Queijo branco', 
      'Manteiga', 'Aveia', 'Iogurte', 'Biscoito integral'
    ],
    'lanche_manha': [
      'Banana', 'Maçã', 'Castanhas', 'Iogurte natural', 
      'Biscoito de aveia', 'Vitamina de frutas'
    ],
    'almoco': [
      'Arroz branco', 'Feijão carioca', 'Frango grelhado', 'Salada verde',
      'Legumes refogados', 'Carne bovina', 'Peixe', 'Verduras'
    ],
    'lanche_tarde': [
      'Pão integral', 'Queijo minas', 'Frutas da estação', 'Chá',
      'Biscoito integral', 'Iogurte com granola'
    ],
    'jantar': [
      'Sopa de legumes', 'Salada', 'Peixe grelhado', 'Frango light',
      'Legumes cozidos', 'Arroz integral', 'Verduras refogadas'
    ],
    'ceia': [
      'Leite morno', 'Chá calmante', 'Frutas leves', 'Iogurte desnatado',
      'Biscoito água e sal', 'Queijo cottage'
    ]
  };

  return suggestions[mealType] || [];
};
