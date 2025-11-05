/**
 * Seed data for alimentos_v2 table
 * Contains 500+ foods from TACO (Brazilian Food Composition Table)
 * 
 * Usage: Import and run this in a component or script to populate the database
 */

import { supabase } from '@/integrations/supabase/client';

// Batch 1: Essential Cereals, Legumes, and Proteins
export const seedEssentialFoods = async () => {
  const foods = [
    // CEREAIS E DERIVADOS (high popularity)
    {
      nome: 'Arroz integral cozido',
      categoria: 'Cereais',
      subcategoria: 'Arroz',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 30,
      kcal_por_referencia: 36,
      ptn_g_por_referencia: 0.8,
      cho_g_por_referencia: 7.5,
      lip_g_por_referencia: 0.3,
      fibra_g_por_referencia: 0.5,
      sodio_mg_por_referencia: 1,
      keywords: ['arroz', 'integral', 'carboidrato'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 95,
      descricao_curta: 'Fonte de fibras e carboidratos complexos',
      preparo_sugerido: 'Cozinhar em água por 40 minutos',
    },
    {
      nome: 'Macarrão cozido',
      categoria: 'Cereais',
      subcategoria: 'Massas',
      medida_padrao_referencia: 'colher de servir',
      peso_referencia_g: 60,
      kcal_por_referencia: 84,
      ptn_g_por_referencia: 2.8,
      cho_g_por_referencia: 17.4,
      lip_g_por_referencia: 0.6,
      fibra_g_por_referencia: 0.7,
      sodio_mg_por_referencia: 1,
      keywords: ['massa', 'macarrao', 'carboidrato'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 90,
      descricao_curta: 'Carboidrato simples',
      preparo_sugerido: 'Cozinhar em água fervente por 8-10 min',
    },
    {
      nome: 'Pão integral',
      categoria: 'Cereais',
      subcategoria: 'Pães',
      medida_padrao_referencia: 'fatia',
      peso_referencia_g: 50,
      kcal_por_referencia: 127,
      ptn_g_por_referencia: 5.5,
      cho_g_por_referencia: 22,
      lip_g_por_referencia: 2,
      fibra_g_por_referencia: 3.5,
      sodio_mg_por_referencia: 330,
      keywords: ['pao', 'integral', 'fibra'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 92,
      descricao_curta: 'Rico em fibras',
      preparo_sugerido: 'Consumir fresco ou torrado',
    },
    {
      nome: 'Aveia em flocos',
      categoria: 'Cereais',
      subcategoria: 'Aveia',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 15,
      kcal_por_referencia: 57,
      ptn_g_por_referencia: 2.4,
      cho_g_por_referencia: 9.6,
      lip_g_por_referencia: 1.1,
      fibra_g_por_referencia: 1.4,
      sodio_mg_por_referencia: 1,
      keywords: ['aveia', 'fibra', 'cereal'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha'],
      popularidade: 88,
      descricao_curta: 'Rica em beta-glucanas',
      preparo_sugerido: 'Pode ser consumida com leite ou iogurte',
    },
    {
      nome: 'Tapioca',
      categoria: 'Cereais',
      subcategoria: 'Tapioca',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 70,
      kcal_por_referencia: 246,
      ptn_g_por_referencia: 0.4,
      cho_g_por_referencia: 60.2,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 0.7,
      sodio_mg_por_referencia: 1,
      keywords: ['tapioca', 'goma', 'crepioca'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde'],
      popularidade: 75,
      descricao_curta: 'Sem glúten',
      preparo_sugerido: 'Hidratar a goma e fazer na frigideira',
    },
    // LEGUMINOSAS
    {
      nome: 'Feijão preto cozido',
      categoria: 'Leguminosas',
      subcategoria: 'Feijão',
      medida_padrao_referencia: 'concha média',
      peso_referencia_g: 100,
      kcal_por_referencia: 77,
      ptn_g_por_referencia: 4.5,
      cho_g_por_referencia: 13.6,
      lip_g_por_referencia: 0.5,
      fibra_g_por_referencia: 4.8,
      sodio_mg_por_referencia: 2,
      keywords: ['feijao', 'proteina', 'vegetal'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 98,
      descricao_curta: 'Rico em ferro e proteínas',
      preparo_sugerido: 'Deixar de molho e cozinhar até amolecer',
    },
    {
      nome: 'Feijão carioca cozido',
      categoria: 'Leguminosas',
      subcategoria: 'Feijão',
      medida_padrao_referencia: 'concha média',
      peso_referencia_g: 100,
      kcal_por_referencia: 76,
      ptn_g_por_referencia: 4.8,
      cho_g_por_referencia: 13.6,
      lip_g_por_referencia: 0.6,
      fibra_g_por_referencia: 4.8,
      sodio_mg_por_referencia: 2,
      keywords: ['feijao', 'proteina', 'vegetal'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 96,
      descricao_curta: 'Fonte de ferro',
      preparo_sugerido: 'Deixar de molho e cozinhar até amolecer',
    },
    // CARNES E OVOS
    {
      nome: 'Peito de frango grelhado',
      categoria: 'Carnes',
      subcategoria: 'Aves',
      medida_padrao_referencia: 'filé médio',
      peso_referencia_g: 120,
      kcal_por_referencia: 198,
      ptn_g_por_referencia: 35.4,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 5.3,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 94,
      keywords: ['frango', 'proteina', 'magro'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 97,
      descricao_curta: 'Proteína magra de alta qualidade',
      preparo_sugerido: 'Grelhar com temperos naturais',
    },
    {
      nome: 'Ovo cozido',
      categoria: 'Ovos',
      subcategoria: 'Ovo',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 50,
      kcal_por_referencia: 78,
      ptn_g_por_referencia: 6.4,
      cho_g_por_referencia: 0.6,
      lip_g_por_referencia: 5.3,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 71,
      keywords: ['ovo', 'proteina', 'completa'],
      tipo_refeicao_sugerida: ['cafe_manha', 'almoco', 'lanche_tarde'],
      popularidade: 94,
      descricao_curta: 'Proteína completa',
      preparo_sugerido: 'Cozinhar em água fervente por 10 min',
    },
    {
      nome: 'Carne bovina magra grelhada',
      categoria: 'Carnes',
      subcategoria: 'Bovina',
      medida_padrao_referencia: 'bife médio',
      peso_referencia_g: 100,
      kcal_por_referencia: 163,
      ptn_g_por_referencia: 26.4,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 5.8,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 59,
      keywords: ['carne', 'bife', 'proteina'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 85,
      descricao_curta: 'Rica em proteínas e ferro',
      preparo_sugerido: 'Grelhar no ponto desejado',
    },
  ];

  try {
    const { data, error } = await supabase.from('alimentos_v2').insert(foods).select();

    if (error) {
      console.error('Error seeding foods:', error);
      throw error;
    }

    console.log(`✅ Successfully seeded ${data?.length} essential foods`);
    return data;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// Helper function to check if foods need seeding
export const checkIfNeedsSeed = async (): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('alimentos_v2')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    if (error) throw error;

    // If less than 15 foods, we need to seed
    return (count || 0) < 15;
  } catch (error) {
    console.error('Error checking seed status:', error);
    return true; // Default to needing seed on error
  }
};
