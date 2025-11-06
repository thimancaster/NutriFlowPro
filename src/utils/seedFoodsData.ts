/**
 * Seed data for alimentos_v2 table
 * Contains 200+ foods from TACO (Brazilian Food Composition Table)
 * 
 * Usage: Import and run this in a component or script to populate the database
 */

import { supabase } from '@/integrations/supabase/client';

// Helper function to insert batch of foods
const insertBatch = async (foods: any[]) => {
  try {
    const { error } = await supabase
      .from('alimentos_v2')
      .insert(foods);
    
    if (error) {
      console.error('Error inserting batch:', error);
      throw error;
    }
    console.log(`✅ Inserted ${foods.length} foods successfully`);
  } catch (error) {
    console.error('❌ Error in insertBatch:', error);
    throw error;
  }
};

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

// Batch 2: Verduras e Legumes
export const seedVegetables = async () => {
  const foods = [
    {
      nome: 'Alface crespa',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Folhosos',
      medida_padrao_referencia: 'folha',
      peso_referencia_g: 15,
      kcal_por_referencia: 2,
      ptn_g_por_referencia: 0.2,
      cho_g_por_referencia: 0.3,
      lip_g_por_referencia: 0,
      fibra_g_por_referencia: 0.3,
      sodio_mg_por_referencia: 3,
      keywords: ['alface', 'salada', 'folha'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 90,
      descricao_curta: 'Rica em fibras e água',
      preparo_sugerido: 'Lavar bem e consumir cru',
    },
    {
      nome: 'Tomate',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Frutos',
      medida_padrao_referencia: 'unidade média',
      peso_referencia_g: 80,
      kcal_por_referencia: 15,
      ptn_g_por_referencia: 0.9,
      cho_g_por_referencia: 3.1,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 1,
      sodio_mg_por_referencia: 2,
      keywords: ['tomate', 'salada', 'molho'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 95,
      descricao_curta: 'Rico em licopeno',
      preparo_sugerido: 'Consumir cru ou cozido',
    },
    {
      nome: 'Brócolis cozido',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Crucíferas',
      medida_padrao_referencia: 'colher de servir',
      peso_referencia_g: 60,
      kcal_por_referencia: 15,
      ptn_g_por_referencia: 1.8,
      cho_g_por_referencia: 2.4,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 1.8,
      sodio_mg_por_referencia: 20,
      keywords: ['brocolis', 'verdura', 'crucifero'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 75,
      descricao_curta: 'Rico em vitamina C',
      preparo_sugerido: 'Cozinhar no vapor por 5-7 min',
    },
    {
      nome: 'Cenoura crua',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Raízes',
      medida_padrao_referencia: 'unidade média',
      peso_referencia_g: 110,
      kcal_por_referencia: 36,
      ptn_g_por_referencia: 1.2,
      cho_g_por_referencia: 8.3,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 3,
      sodio_mg_por_referencia: 81,
      keywords: ['cenoura', 'raiz', 'vitamina-a'],
      tipo_refeicao_sugerida: ['almoco', 'jantar', 'lanche_tarde'],
      popularidade: 88,
      descricao_curta: 'Rica em vitamina A',
      preparo_sugerido: 'Consumir cru ou cozido',
    },
    {
      nome: 'Batata inglesa cozida',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Tubérculos',
      medida_padrao_referencia: 'unidade média',
      peso_referencia_g: 150,
      kcal_por_referencia: 105,
      ptn_g_por_referencia: 2.4,
      cho_g_por_referencia: 24,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 1.8,
      sodio_mg_por_referencia: 3,
      keywords: ['batata', 'tuberculo', 'carboidrato'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 92,
      descricao_curta: 'Fonte de carboidrato',
      preparo_sugerido: 'Cozinhar em água por 20-25 min',
    },
    {
      nome: 'Batata doce cozida',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Tubérculos',
      medida_padrao_referencia: 'unidade média',
      peso_referencia_g: 100,
      kcal_por_referencia: 77,
      ptn_g_por_referencia: 0.6,
      cho_g_por_referencia: 18.4,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 2.2,
      sodio_mg_por_referencia: 9,
      keywords: ['batata-doce', 'tuberculo', 'carboidrato'],
      tipo_refeicao_sugerida: ['cafe_manha', 'almoco', 'jantar', 'lanche_tarde'],
      popularidade: 85,
      descricao_curta: 'Carboidrato de baixo IG',
      preparo_sugerido: 'Cozinhar ou assar por 30 min',
    },
    {
      nome: 'Abóbora cozida',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Frutos',
      medida_padrao_referencia: 'colher de servir',
      peso_referencia_g: 60,
      kcal_por_referencia: 16,
      ptn_g_por_referencia: 0.6,
      cho_g_por_referencia: 3.8,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 1.5,
      sodio_mg_por_referencia: 1,
      keywords: ['abobora', 'moranga', 'jerimum'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 70,
      descricao_curta: 'Rica em vitamina A',
      preparo_sugerido: 'Cozinhar em água por 15 min',
    },
    {
      nome: 'Chuchu cozido',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Frutos',
      medida_padrao_referencia: 'colher de servir',
      peso_referencia_g: 60,
      kcal_por_referencia: 11,
      ptn_g_por_referencia: 0.5,
      cho_g_por_referencia: 2.6,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 0.6,
      sodio_mg_por_referencia: 1,
      keywords: ['chuchu', 'verdura'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 65,
      descricao_curta: 'Baixas calorias',
      preparo_sugerido: 'Cozinhar em água por 10 min',
    },
    {
      nome: 'Abobrinha cozida',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Frutos',
      medida_padrao_referencia: 'colher de servir',
      peso_referencia_g: 60,
      kcal_por_referencia: 10,
      ptn_g_por_referencia: 0.7,
      cho_g_por_referencia: 2,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 0.6,
      sodio_mg_por_referencia: 1,
      keywords: ['abobrinha', 'verdura'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 72,
      descricao_curta: 'Baixas calorias',
      preparo_sugerido: 'Cozinhar ou refogar por 8 min',
    },
    {
      nome: 'Couve manteiga refogada',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Folhosos',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 25,
      kcal_por_referencia: 9,
      ptn_g_por_referencia: 0.6,
      cho_g_por_referencia: 1.5,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 0.8,
      sodio_mg_por_referencia: 3,
      keywords: ['couve', 'folha', 'verde'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 80,
      descricao_curta: 'Rica em ferro e cálcio',
      preparo_sugerido: 'Refogar rapidamente',
    },
  ];

  try {
    const { data, error } = await supabase.from('alimentos_v2').insert(foods).select();
    if (error) throw error;
    console.log(`✅ Successfully seeded ${data?.length} vegetables`);
    return data;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// Batch 3: Frutas
export const seedFruits = async () => {
  const foods = [
    {
      nome: 'Banana prata',
      categoria: 'Frutas',
      subcategoria: 'Tropical',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 70,
      kcal_por_referencia: 62,
      ptn_g_por_referencia: 0.8,
      cho_g_por_referencia: 15.7,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 1.3,
      sodio_mg_por_referencia: 0,
      keywords: ['banana', 'fruta', 'potassio'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 95,
      descricao_curta: 'Rica em potássio',
      preparo_sugerido: 'Consumir in natura',
    },
    {
      nome: 'Maçã',
      categoria: 'Frutas',
      subcategoria: 'Pomóideas',
      medida_padrao_referencia: 'unidade média',
      peso_referencia_g: 130,
      kcal_por_referencia: 69,
      ptn_g_por_referencia: 0.3,
      cho_g_por_referencia: 18.6,
      lip_g_por_referencia: 0.3,
      fibra_g_por_referencia: 1.3,
      sodio_mg_por_referencia: 1,
      keywords: ['maca', 'fruta', 'fibra'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 88,
      descricao_curta: 'Rica em fibras',
      preparo_sugerido: 'Consumir com casca',
    },
    {
      nome: 'Laranja pera',
      categoria: 'Frutas',
      subcategoria: 'Cítrica',
      medida_padrao_referencia: 'unidade média',
      peso_referencia_g: 180,
      kcal_por_referencia: 81,
      ptn_g_por_referencia: 1.6,
      cho_g_por_referencia: 20.5,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 2.2,
      sodio_mg_por_referencia: 0,
      keywords: ['laranja', 'citrica', 'vitamina-c'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 90,
      descricao_curta: 'Rica em vitamina C',
      preparo_sugerido: 'Consumir in natura ou suco',
    },
    {
      nome: 'Mamão papaya',
      categoria: 'Frutas',
      subcategoria: 'Tropical',
      medida_padrao_referencia: 'fatia',
      peso_referencia_g: 100,
      kcal_por_referencia: 40,
      ptn_g_por_referencia: 0.5,
      cho_g_por_referencia: 10.4,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 1,
      sodio_mg_por_referencia: 3,
      keywords: ['mamao', 'papaia', 'fruta'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 82,
      descricao_curta: 'Rico em papaína',
      preparo_sugerido: 'Consumir in natura',
    },
    {
      nome: 'Morango',
      categoria: 'Frutas',
      subcategoria: 'Berries',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 12,
      kcal_por_referencia: 4,
      ptn_g_por_referencia: 0.1,
      cho_g_por_referencia: 0.9,
      lip_g_por_referencia: 0,
      fibra_g_por_referencia: 0.2,
      sodio_mg_por_referencia: 0,
      keywords: ['morango', 'berry', 'antioxidante'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 78,
      descricao_curta: 'Rico em antioxidantes',
      preparo_sugerido: 'Lavar bem e consumir',
    },
    {
      nome: 'Melancia',
      categoria: 'Frutas',
      subcategoria: 'Melão',
      medida_padrao_referencia: 'fatia',
      peso_referencia_g: 100,
      kcal_por_referencia: 30,
      ptn_g_por_referencia: 0.6,
      cho_g_por_referencia: 7.6,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 0.4,
      sodio_mg_por_referencia: 1,
      keywords: ['melancia', 'fruta', 'hidratante'],
      tipo_refeicao_sugerida: ['lanche_manha', 'lanche_tarde'],
      popularidade: 85,
      descricao_curta: 'Muito hidratante',
      preparo_sugerido: 'Consumir gelada',
    },
    {
      nome: 'Abacaxi',
      categoria: 'Frutas',
      subcategoria: 'Tropical',
      medida_padrao_referencia: 'fatia',
      peso_referencia_g: 100,
      kcal_por_referencia: 48,
      ptn_g_por_referencia: 0.5,
      cho_g_por_referencia: 12.3,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 1,
      sodio_mg_por_referencia: 1,
      keywords: ['abacaxi', 'ananas', 'bromelina'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 80,
      descricao_curta: 'Rico em bromelina',
      preparo_sugerido: 'Consumir in natura',
    },
    {
      nome: 'Uva',
      categoria: 'Frutas',
      subcategoria: 'Berries',
      medida_padrao_referencia: 'cacho pequeno',
      peso_referencia_g: 100,
      kcal_por_referencia: 69,
      ptn_g_por_referencia: 0.6,
      cho_g_por_referencia: 18,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 0.9,
      sodio_mg_por_referencia: 2,
      keywords: ['uva', 'fruta', 'resveratrol'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 75,
      descricao_curta: 'Rica em resveratrol',
      preparo_sugerido: 'Lavar bem e consumir',
    },
    {
      nome: 'Manga',
      categoria: 'Frutas',
      subcategoria: 'Tropical',
      medida_padrao_referencia: 'unidade média',
      peso_referencia_g: 110,
      kcal_por_referencia: 56,
      ptn_g_por_referencia: 0.4,
      cho_g_por_referencia: 15,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 1.6,
      sodio_mg_por_referencia: 1,
      keywords: ['manga', 'fruta', 'tropical'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 83,
      descricao_curta: 'Rica em vitamina A',
      preparo_sugerido: 'Consumir in natura',
    },
    {
      nome: 'Pera',
      categoria: 'Frutas',
      subcategoria: 'Pomóideas',
      medida_padrao_referencia: 'unidade média',
      peso_referencia_g: 150,
      kcal_por_referencia: 61,
      ptn_g_por_referencia: 0.5,
      cho_g_por_referencia: 16.4,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 3,
      sodio_mg_por_referencia: 2,
      keywords: ['pera', 'fruta', 'fibra'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 70,
      descricao_curta: 'Rica em fibras',
      preparo_sugerido: 'Consumir com casca',
    },
  ];

  try {
    const { data, error } = await supabase.from('alimentos_v2').insert(foods).select();
    if (error) throw error;
    console.log(`✅ Successfully seeded ${data?.length} fruits`);
    return data;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// Batch 4: Laticínios
export const seedDairy = async () => {
  const foods = [
    {
      nome: 'Leite integral',
      categoria: 'Laticínios',
      subcategoria: 'Leite',
      medida_padrao_referencia: 'copo',
      peso_referencia_g: 200,
      kcal_por_referencia: 122,
      ptn_g_por_referencia: 6.4,
      cho_g_por_referencia: 9.4,
      lip_g_por_referencia: 6.2,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 82,
      keywords: ['leite', 'lacteo', 'calcio'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde', 'ceia'],
      popularidade: 90,
      descricao_curta: 'Rico em cálcio',
      preparo_sugerido: 'Consumir gelado',
    },
    {
      nome: 'Leite desnatado',
      categoria: 'Laticínios',
      subcategoria: 'Leite',
      medida_padrao_referencia: 'copo',
      peso_referencia_g: 200,
      kcal_por_referencia: 70,
      ptn_g_por_referencia: 6.8,
      cho_g_por_referencia: 9.8,
      lip_g_por_referencia: 0.4,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 100,
      keywords: ['leite', 'desnatado', 'light'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde', 'ceia'],
      popularidade: 85,
      descricao_curta: 'Baixo teor de gordura',
      preparo_sugerido: 'Consumir gelado',
    },
    {
      nome: 'Iogurte natural integral',
      categoria: 'Laticínios',
      subcategoria: 'Iogurte',
      medida_padrao_referencia: 'pote',
      peso_referencia_g: 170,
      kcal_por_referencia: 102,
      ptn_g_por_referencia: 5.8,
      cho_g_por_referencia: 8.7,
      lip_g_por_referencia: 5.1,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 76,
      keywords: ['iogurte', 'natural', 'probiotico'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 88,
      descricao_curta: 'Rico em probióticos',
      preparo_sugerido: 'Consumir gelado',
    },
    {
      nome: 'Iogurte grego natural',
      categoria: 'Laticínios',
      subcategoria: 'Iogurte',
      medida_padrao_referencia: 'pote',
      peso_referencia_g: 150,
      kcal_por_referencia: 97,
      ptn_g_por_referencia: 9,
      cho_g_por_referencia: 5.4,
      lip_g_por_referencia: 4.5,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 45,
      keywords: ['iogurte', 'grego', 'proteina'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'lanche_tarde'],
      popularidade: 82,
      descricao_curta: 'Alto teor de proteína',
      preparo_sugerido: 'Consumir gelado',
    },
    {
      nome: 'Queijo minas frescal',
      categoria: 'Laticínios',
      subcategoria: 'Queijo',
      medida_padrao_referencia: 'fatia',
      peso_referencia_g: 30,
      kcal_por_referencia: 79,
      ptn_g_por_referencia: 5.3,
      cho_g_por_referencia: 1,
      lip_g_por_referencia: 6.3,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 122,
      keywords: ['queijo', 'minas', 'frescal'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde'],
      popularidade: 85,
      descricao_curta: 'Fonte de cálcio',
      preparo_sugerido: 'Consumir fresco',
    },
    {
      nome: 'Queijo cottage',
      categoria: 'Laticínios',
      subcategoria: 'Queijo',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 45,
      kcal_por_referencia: 43,
      ptn_g_por_referencia: 5.5,
      cho_g_por_referencia: 1.5,
      lip_g_por_referencia: 1.9,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 180,
      keywords: ['queijo', 'cottage', 'light'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde', 'jantar'],
      popularidade: 75,
      descricao_curta: 'Baixa caloria',
      preparo_sugerido: 'Consumir gelado',
    },
    {
      nome: 'Ricota fresca',
      categoria: 'Laticínios',
      subcategoria: 'Queijo',
      medida_padrao_referencia: 'fatia',
      peso_referencia_g: 30,
      kcal_por_referencia: 42,
      ptn_g_por_referencia: 3.4,
      cho_g_por_referencia: 1.2,
      lip_g_por_referencia: 2.9,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 24,
      keywords: ['ricota', 'queijo', 'light'],
      tipo_refeicao_sugerida: ['cafe_manha', 'almoco', 'jantar'],
      popularidade: 78,
      descricao_curta: 'Baixa gordura',
      preparo_sugerido: 'Consumir fresca',
    },
    {
      nome: 'Requeijão cremoso',
      categoria: 'Laticínios',
      subcategoria: 'Queijo',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 30,
      kcal_por_referencia: 69,
      ptn_g_por_referencia: 2.3,
      cho_g_por_referencia: 1.5,
      lip_g_por_referencia: 6.3,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 195,
      keywords: ['requeijao', 'cremoso', 'queijo'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde'],
      popularidade: 80,
      descricao_curta: 'Cremoso',
      preparo_sugerido: 'Passar no pão',
    },
  ];

  try {
    const { data, error } = await supabase.from('alimentos_v2').insert(foods).select();
    if (error) throw error;
    console.log(`✅ Successfully seeded ${data?.length} dairy products`);
    return data;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// Batch 5: Proteínas Animais Adicionais
export const seedMoreProteins = async () => {
  const foods = [
    {
      nome: 'Tilápia grelhada',
      categoria: 'Carnes',
      subcategoria: 'Peixes',
      medida_padrao_referencia: 'filé',
      peso_referencia_g: 100,
      kcal_por_referencia: 96,
      ptn_g_por_referencia: 20.1,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 1.5,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 50,
      keywords: ['peixe', 'tilapia', 'proteina'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 82,
      descricao_curta: 'Peixe magro',
      preparo_sugerido: 'Grelhar com temperos',
    },
    {
      nome: 'Salmão grelhado',
      categoria: 'Carnes',
      subcategoria: 'Peixes',
      medida_padrao_referencia: 'filé',
      peso_referencia_g: 100,
      kcal_por_referencia: 211,
      ptn_g_por_referencia: 23.8,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 12.4,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 59,
      keywords: ['salmao', 'peixe', 'omega3'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 75,
      descricao_curta: 'Rico em ômega-3',
      preparo_sugerido: 'Grelhar ou assar',
    },
    {
      nome: 'Atum em água',
      categoria: 'Carnes',
      subcategoria: 'Peixes',
      medida_padrao_referencia: 'lata',
      peso_referencia_g: 120,
      kcal_por_referencia: 142,
      ptn_g_por_referencia: 31.2,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 1.4,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 468,
      keywords: ['atum', 'peixe', 'conserva'],
      tipo_refeicao_sugerida: ['almoco', 'jantar', 'lanche_tarde'],
      popularidade: 85,
      descricao_curta: 'Alto teor de proteína',
      preparo_sugerido: 'Consumir direto ou em salada',
    },
    {
      nome: 'Sardinha em conserva',
      categoria: 'Carnes',
      subcategoria: 'Peixes',
      medida_padrao_referencia: 'lata',
      peso_referencia_g: 130,
      kcal_por_referencia: 221,
      ptn_g_por_referencia: 24.6,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 13.5,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 505,
      keywords: ['sardinha', 'peixe', 'conserva'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 70,
      descricao_curta: 'Rica em cálcio e ômega-3',
      preparo_sugerido: 'Consumir diretamente',
    },
    {
      nome: 'Peito de peru defumado',
      categoria: 'Carnes',
      subcategoria: 'Aves',
      medida_padrao_referencia: 'fatia',
      peso_referencia_g: 30,
      kcal_por_referencia: 30,
      ptn_g_por_referencia: 5.7,
      cho_g_por_referencia: 1.5,
      lip_g_por_referencia: 0.3,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 330,
      keywords: ['peru', 'defumado', 'frios'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde'],
      popularidade: 78,
      descricao_curta: 'Baixa gordura',
      preparo_sugerido: 'Consumir direto',
    },
    {
      nome: 'Carne moída magra',
      categoria: 'Carnes',
      subcategoria: 'Bovina',
      medida_padrao_referencia: 'colher de servir',
      peso_referencia_g: 80,
      kcal_por_referencia: 163,
      ptn_g_por_referencia: 21.1,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 8.6,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 59,
      keywords: ['carne', 'moida', 'boi'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 88,
      descricao_curta: 'Versátil',
      preparo_sugerido: 'Refogar ou grelhar',
    },
    {
      nome: 'Coxa de frango sem pele',
      categoria: 'Carnes',
      subcategoria: 'Aves',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 100,
      kcal_por_referencia: 125,
      ptn_g_por_referencia: 19.7,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 4.7,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 90,
      keywords: ['frango', 'coxa', 'proteina'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 82,
      descricao_curta: 'Fonte de proteína',
      preparo_sugerido: 'Assar ou grelhar',
    },
    {
      nome: 'Ovo mexido',
      categoria: 'Ovos',
      subcategoria: 'Ovo',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 50,
      kcal_por_referencia: 91,
      ptn_g_por_referencia: 6.3,
      cho_g_por_referencia: 0.7,
      lip_g_por_referencia: 6.9,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 145,
      keywords: ['ovo', 'mexido', 'proteina'],
      tipo_refeicao_sugerida: ['cafe_manha', 'almoco'],
      popularidade: 90,
      descricao_curta: 'Prático e nutritivo',
      preparo_sugerido: 'Mexer em fogo baixo',
    },
  ];

  try {
    const { data, error } = await supabase.from('alimentos_v2').insert(foods).select();
    if (error) throw error;
    console.log(`✅ Successfully seeded ${data?.length} additional proteins`);
    return data;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// Batch 6: Oleaginosas e Sementes
export const seedNutsAndSeeds = async () => {
  const foods = [
    {
      nome: 'Amendoim torrado',
      categoria: 'Oleaginosas',
      subcategoria: 'Leguminosa',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 15,
      kcal_por_referencia: 85,
      ptn_g_por_referencia: 3.8,
      cho_g_por_referencia: 2.4,
      lip_g_por_referencia: 7.1,
      fibra_g_por_referencia: 1.2,
      sodio_mg_por_referencia: 1,
      keywords: ['amendoim', 'oleaginosa', 'gordura-boa'],
      tipo_refeicao_sugerida: ['lanche_manha', 'lanche_tarde'],
      popularidade: 85,
      descricao_curta: 'Rico em gorduras boas',
      preparo_sugerido: 'Consumir torrado sem sal',
    },
    {
      nome: 'Castanha do Pará',
      categoria: 'Oleaginosas',
      subcategoria: 'Castanha',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 5,
      kcal_por_referencia: 33,
      ptn_g_por_referencia: 0.7,
      cho_g_por_referencia: 0.6,
      lip_g_por_referencia: 3.3,
      fibra_g_por_referencia: 0.4,
      sodio_mg_por_referencia: 0,
      keywords: ['castanha', 'para', 'selenio'],
      tipo_refeicao_sugerida: ['lanche_manha', 'lanche_tarde'],
      popularidade: 70,
      descricao_curta: 'Rica em selênio',
      preparo_sugerido: 'Consumir 2 unidades por dia',
    },
    {
      nome: 'Castanha de caju',
      categoria: 'Oleaginosas',
      subcategoria: 'Castanha',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 1.5,
      kcal_por_referencia: 9,
      ptn_g_por_referencia: 0.3,
      cho_g_por_referencia: 0.5,
      lip_g_por_referencia: 0.7,
      fibra_g_por_referencia: 0.1,
      sodio_mg_por_referencia: 2,
      keywords: ['castanha', 'caju', 'oleaginosa'],
      tipo_refeicao_sugerida: ['lanche_manha', 'lanche_tarde'],
      popularidade: 75,
      descricao_curta: 'Rica em magnésio',
      preparo_sugerido: 'Consumir como snack',
    },
    {
      nome: 'Amêndoa',
      categoria: 'Oleaginosas',
      subcategoria: 'Castanha',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 1.2,
      kcal_por_referencia: 7,
      ptn_g_por_referencia: 0.3,
      cho_g_por_referencia: 0.2,
      lip_g_por_referencia: 0.6,
      fibra_g_por_referencia: 0.1,
      sodio_mg_por_referencia: 0,
      keywords: ['amendoa', 'oleaginosa', 'vitamina-e'],
      tipo_refeicao_sugerida: ['lanche_manha', 'lanche_tarde'],
      popularidade: 72,
      descricao_curta: 'Rica em vitamina E',
      preparo_sugerido: 'Consumir como snack',
    },
    {
      nome: 'Nozes',
      categoria: 'Oleaginosas',
      subcategoria: 'Castanha',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 5,
      kcal_por_referencia: 33,
      ptn_g_por_referencia: 0.8,
      cho_g_por_referencia: 0.7,
      lip_g_por_referencia: 3.3,
      fibra_g_por_referencia: 0.3,
      sodio_mg_por_referencia: 0,
      keywords: ['noz', 'oleaginosa', 'omega3'],
      tipo_refeicao_sugerida: ['lanche_manha', 'lanche_tarde'],
      popularidade: 68,
      descricao_curta: 'Rica em ômega-3',
      preparo_sugerido: 'Consumir como snack',
    },
    {
      nome: 'Chia',
      categoria: 'Oleaginosas',
      subcategoria: 'Sementes',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 15,
      kcal_por_referencia: 69,
      ptn_g_por_referencia: 2.3,
      cho_g_por_referencia: 5.9,
      lip_g_por_referencia: 4.5,
      fibra_g_por_referencia: 5.3,
      sodio_mg_por_referencia: 2,
      keywords: ['chia', 'semente', 'omega3', 'fibra'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha'],
      popularidade: 78,
      descricao_curta: 'Rica em fibras e ômega-3',
      preparo_sugerido: 'Hidratar ou polvilhar',
    },
    {
      nome: 'Linhaça dourada',
      categoria: 'Oleaginosas',
      subcategoria: 'Sementes',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 10,
      kcal_por_referencia: 50,
      ptn_g_por_referencia: 1.8,
      cho_g_por_referencia: 2.9,
      lip_g_por_referencia: 4.1,
      fibra_g_por_referencia: 2.7,
      sodio_mg_por_referencia: 3,
      keywords: ['linhaca', 'semente', 'omega3'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha'],
      popularidade: 75,
      descricao_curta: 'Rica em ômega-3',
      preparo_sugerido: 'Moer antes de consumir',
    },
    {
      nome: 'Gergelim',
      categoria: 'Oleaginosas',
      subcategoria: 'Sementes',
      medida_padrao_referencia: 'colher de chá',
      peso_referencia_g: 5,
      kcal_por_referencia: 28,
      ptn_g_por_referencia: 0.9,
      cho_g_por_referencia: 1.2,
      lip_g_por_referencia: 2.4,
      fibra_g_por_referencia: 0.6,
      sodio_mg_por_referencia: 1,
      keywords: ['gergelim', 'semente', 'calcio'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 65,
      descricao_curta: 'Rico em cálcio',
      preparo_sugerido: 'Polvilhar sobre alimentos',
    },
  ];

  try {
    const { data, error } = await supabase.from('alimentos_v2').insert(foods).select();
    if (error) throw error;
    console.log(`✅ Successfully seeded ${data?.length} nuts and seeds`);
    return data;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// Batch 7: Gorduras e Óleos
export const seedFatsAndOils = async () => {
  const foods = [
    {
      nome: 'Azeite de oliva extra virgem',
      categoria: 'Óleos e Gorduras',
      subcategoria: 'Óleos',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 13,
      kcal_por_referencia: 115,
      ptn_g_por_referencia: 0,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 13,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 0,
      keywords: ['azeite', 'oliva', 'gordura-boa'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 92,
      descricao_curta: 'Rico em antioxidantes',
      preparo_sugerido: 'Usar a frio ou baixa temperatura',
    },
    {
      nome: 'Óleo de coco',
      categoria: 'Óleos e Gorduras',
      subcategoria: 'Óleos',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 13,
      kcal_por_referencia: 117,
      ptn_g_por_referencia: 0,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 13,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 0,
      keywords: ['coco', 'oleo', 'mct'],
      tipo_refeicao_sugerida: ['cafe_manha', 'almoco', 'jantar'],
      popularidade: 70,
      descricao_curta: 'Rico em TCM',
      preparo_sugerido: 'Usar para cozinhar',
    },
    {
      nome: 'Manteiga',
      categoria: 'Óleos e Gorduras',
      subcategoria: 'Gorduras',
      medida_padrao_referencia: 'colher de chá',
      peso_referencia_g: 5,
      kcal_por_referencia: 37,
      ptn_g_por_referencia: 0,
      cho_g_por_referencia: 0,
      lip_g_por_referencia: 4.1,
      fibra_g_por_referencia: 0,
      sodio_mg_por_referencia: 41,
      keywords: ['manteiga', 'gordura', 'lacteo'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde'],
      popularidade: 85,
      descricao_curta: 'Fonte de vitamina A',
      preparo_sugerido: 'Passar no pão ou cozinhar',
    },
    {
      nome: 'Abacate',
      categoria: 'Frutas',
      subcategoria: 'Tropical',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 30,
      kcal_por_referencia: 48,
      ptn_g_por_referencia: 0.6,
      cho_g_por_referencia: 2.6,
      lip_g_por_referencia: 4.4,
      fibra_g_por_referencia: 2,
      sodio_mg_por_referencia: 2,
      keywords: ['abacate', 'gordura-boa', 'fruta'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha', 'almoco'],
      popularidade: 80,
      descricao_curta: 'Rico em gorduras monoinsaturadas',
      preparo_sugerido: 'Consumir in natura ou em vitamina',
    },
  ];

  try {
    const { data, error } = await supabase.from('alimentos_v2').insert(foods).select();
    if (error) throw error;
    console.log(`✅ Successfully seeded ${data?.length} fats and oils`);
    return data;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// Batch 8: Cereais Adicionais
export const seedMoreCereals = async () => {
  const foods = [
    {
      nome: 'Arroz branco cozido',
      categoria: 'Cereais',
      subcategoria: 'Arroz',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 30,
      kcal_por_referencia: 41,
      ptn_g_por_referencia: 0.8,
      cho_g_por_referencia: 8.9,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 0.3,
      sodio_mg_por_referencia: 1,
      keywords: ['arroz', 'branco', 'carboidrato'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 98,
      descricao_curta: 'Carboidrato simples',
      preparo_sugerido: 'Cozinhar em água por 20 min',
    },
    {
      nome: 'Quinoa cozida',
      categoria: 'Cereais',
      subcategoria: 'Grãos',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 30,
      kcal_por_referencia: 36,
      ptn_g_por_referencia: 1.2,
      cho_g_por_referencia: 6.4,
      lip_g_por_referencia: 0.6,
      fibra_g_por_referencia: 0.8,
      sodio_mg_por_referencia: 2,
      keywords: ['quinoa', 'grao', 'proteina'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 68,
      descricao_curta: 'Proteína completa',
      preparo_sugerido: 'Cozinhar em água por 15 min',
    },
    {
      nome: 'Granola',
      categoria: 'Cereais',
      subcategoria: 'Mix',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 20,
      kcal_por_referencia: 87,
      ptn_g_por_referencia: 2.3,
      cho_g_por_referencia: 12.8,
      lip_g_por_referencia: 3.2,
      fibra_g_por_referencia: 1.4,
      sodio_mg_por_referencia: 15,
      keywords: ['granola', 'cereal', 'fibra'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_manha'],
      popularidade: 75,
      descricao_curta: 'Rica em fibras',
      preparo_sugerido: 'Consumir com iogurte ou leite',
    },
    {
      nome: 'Pão francês',
      categoria: 'Cereais',
      subcategoria: 'Pães',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 50,
      kcal_por_referencia: 145,
      ptn_g_por_referencia: 4.6,
      cho_g_por_referencia: 29,
      lip_g_por_referencia: 1.6,
      fibra_g_por_referencia: 1.2,
      sodio_mg_por_referencia: 326,
      keywords: ['pao', 'frances', 'carboidrato'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde'],
      popularidade: 95,
      descricao_curta: 'Tradicional brasileiro',
      preparo_sugerido: 'Consumir fresco',
    },
    {
      nome: 'Torrada integral',
      categoria: 'Cereais',
      subcategoria: 'Pães',
      medida_padrao_referencia: 'unidade',
      peso_referencia_g: 10,
      kcal_por_referencia: 40,
      ptn_g_por_referencia: 1.4,
      cho_g_por_referencia: 7.5,
      lip_g_por_referencia: 0.5,
      fibra_g_por_referencia: 0.9,
      sodio_mg_por_referencia: 80,
      keywords: ['torrada', 'integral', 'fibra'],
      tipo_refeicao_sugerida: ['cafe_manha', 'lanche_tarde'],
      popularidade: 72,
      descricao_curta: 'Baixa caloria',
      preparo_sugerido: 'Consumir com pasta',
    },
    {
      nome: 'Batata baroa cozida',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Tubérculos',
      medida_padrao_referencia: 'unidade média',
      peso_referencia_g: 100,
      kcal_por_referencia: 95,
      ptn_g_por_referencia: 1,
      cho_g_por_referencia: 23.3,
      lip_g_por_referencia: 0.2,
      fibra_g_por_referencia: 2.3,
      sodio_mg_por_referencia: 7,
      keywords: ['batata-baroa', 'mandioquinha', 'tuberculo'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 65,
      descricao_curta: 'Rica em vitamina A',
      preparo_sugerido: 'Cozinhar por 20 min',
    },
    {
      nome: 'Mandioca cozida',
      categoria: 'Verduras e Legumes',
      subcategoria: 'Tubérculos',
      medida_padrao_referencia: 'pedaço',
      peso_referencia_g: 100,
      kcal_por_referencia: 125,
      ptn_g_por_referencia: 0.6,
      cho_g_por_referencia: 30.1,
      lip_g_por_referencia: 0.3,
      fibra_g_por_referencia: 1.6,
      sodio_mg_por_referencia: 1,
      keywords: ['mandioca', 'aipim', 'macaxeira'],
      tipo_refeicao_sugerida: ['almoco', 'jantar', 'lanche_tarde'],
      popularidade: 75,
      descricao_curta: 'Fonte de energia',
      preparo_sugerido: 'Cozinhar por 30 min',
    },
  ];

  try {
    const { data, error } = await supabase.from('alimentos_v2').insert(foods).select();
    if (error) throw error;
    console.log(`✅ Successfully seeded ${data?.length} additional cereals`);
    return data;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// Batch 9: Leguminosas Adicionais
export const seedMoreLegumes = async () => {
  const foods = [
    {
      nome: 'Lentilha cozida',
      categoria: 'Leguminosas',
      subcategoria: 'Leguminosa',
      medida_padrao_referencia: 'concha média',
      peso_referencia_g: 100,
      kcal_por_referencia: 93,
      ptn_g_por_referencia: 6.3,
      cho_g_por_referencia: 16,
      lip_g_por_referencia: 0.5,
      fibra_g_por_referencia: 5.1,
      sodio_mg_por_referencia: 2,
      keywords: ['lentilha', 'leguminosa', 'ferro'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 65,
      descricao_curta: 'Rica em ferro',
      preparo_sugerido: 'Cozinhar por 25 min',
    },
    {
      nome: 'Grão de bico cozido',
      categoria: 'Leguminosas',
      subcategoria: 'Leguminosa',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 30,
      kcal_por_referencia: 41,
      ptn_g_por_referencia: 2.4,
      cho_g_por_referencia: 7,
      lip_g_por_referencia: 0.6,
      fibra_g_por_referencia: 2.1,
      sodio_mg_por_referencia: 2,
      keywords: ['grao-de-bico', 'leguminosa', 'proteina'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 70,
      descricao_curta: 'Rico em proteína vegetal',
      preparo_sugerido: 'Deixar de molho e cozinhar por 40 min',
    },
    {
      nome: 'Ervilha fresca cozida',
      categoria: 'Leguminosas',
      subcategoria: 'Leguminosa',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 30,
      kcal_por_referencia: 21,
      ptn_g_por_referencia: 1.5,
      cho_g_por_referencia: 3.6,
      lip_g_por_referencia: 0.1,
      fibra_g_por_referencia: 1.6,
      sodio_mg_por_referencia: 1,
      keywords: ['ervilha', 'leguminosa', 'proteina'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 75,
      descricao_curta: 'Rica em fibras',
      preparo_sugerido: 'Cozinhar por 15 min',
    },
    {
      nome: 'Soja cozida',
      categoria: 'Leguminosas',
      subcategoria: 'Leguminosa',
      medida_padrao_referencia: 'colher de sopa',
      peso_referencia_g: 30,
      kcal_por_referencia: 42,
      ptn_g_por_referencia: 3.9,
      cho_g_por_referencia: 2.7,
      lip_g_por_referencia: 2,
      fibra_g_por_referencia: 1.8,
      sodio_mg_por_referencia: 0,
      keywords: ['soja', 'leguminosa', 'proteina'],
      tipo_refeicao_sugerida: ['almoco', 'jantar'],
      popularidade: 60,
      descricao_curta: 'Proteína completa',
      preparo_sugerido: 'Deixar de molho e cozinhar por 60 min',
    },
  ];

  try {
    const { data, error } = await supabase.from('alimentos_v2').insert(foods).select();
    if (error) throw error;
    console.log(`✅ Successfully seeded ${data?.length} additional legumes`);
    return data;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// ========================================
// TACO EXPANDED DATABASE (200+ FOODS)
// ========================================

// Seed adicional: Mais cereais TACO
export const seedTacoCereals = async () => {
  const cereals = [
    { nome: 'Arroz integral cozido', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '4 colheres de sopa', kcal_por_referencia: 124, ptn_g_por_referencia: 2.6, cho_g_por_referencia: 25.8, lip_g_por_referencia: 1.0, fibra_g_por_referencia: 2.7, keywords: ['arroz', 'integral', 'cereal'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Arroz parboilizado cozido', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '4 colheres de sopa', kcal_por_referencia: 123, ptn_g_por_referencia: 2.5, cho_g_por_referencia: 26.2, lip_g_por_referencia: 0.4, fibra_g_por_referencia: 1.6, keywords: ['arroz', 'parboilizado'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Aveia em flocos', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '8 colheres de sopa', kcal_por_referencia: 394, ptn_g_por_referencia: 13.9, cho_g_por_referencia: 66.6, lip_g_por_referencia: 8.5, fibra_g_por_referencia: 9.1, keywords: ['aveia', 'flocos', 'cereal'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
    { nome: 'Farinha de aveia', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '10 colheres de sopa', kcal_por_referencia: 405, ptn_g_por_referencia: 15.3, cho_g_por_referencia: 67.5, lip_g_por_referencia: 9.7, fibra_g_por_referencia: 6.5, keywords: ['farinha', 'aveia'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
    { nome: 'Farinha de milho amarela', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '10 colheres de sopa', kcal_por_referencia: 361, ptn_g_por_referencia: 7.9, cho_g_por_referencia: 77.5, lip_g_por_referencia: 1.9, fibra_g_por_referencia: 5.3, keywords: ['farinha', 'milho'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Fubá de milho', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '10 colheres de sopa', kcal_por_referencia: 358, ptn_g_por_referencia: 7.4, cho_g_por_referencia: 78.6, lip_g_por_referencia: 1.5, fibra_g_por_referencia: 3.9, keywords: ['fubá', 'milho'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
    { nome: 'Macarrão cozido', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '2 colheres de servir', kcal_por_referencia: 111, ptn_g_por_referencia: 3.7, cho_g_por_referencia: 23.0, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 1.1, keywords: ['macarrão', 'massa'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Macarrão integral cozido', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '2 colheres de servir', kcal_por_referencia: 109, ptn_g_por_referencia: 4.3, cho_g_por_referencia: 21.7, lip_g_por_referencia: 0.5, fibra_g_por_referencia: 3.5, keywords: ['macarrão', 'integral'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Pão francês', categoria: 'Cereais e Derivados', peso_referencia_g: 50, medida_padrao_referencia: '1 unidade', kcal_por_referencia: 150, ptn_g_por_referencia: 4.5, cho_g_por_referencia: 29.5, lip_g_por_referencia: 1.65, fibra_g_por_referencia: 1.2, keywords: ['pão', 'francês'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
    { nome: 'Pão de forma integral', categoria: 'Cereais e Derivados', peso_referencia_g: 25, medida_padrao_referencia: '1 fatia', kcal_por_referencia: 64, ptn_g_por_referencia: 2.45, cho_g_por_referencia: 11.2, lip_g_por_referencia: 0.95, fibra_g_por_referencia: 1.8, keywords: ['pão', 'forma', 'integral'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
    { nome: 'Quinoa em grãos cozida', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '4 colheres de sopa', kcal_por_referencia: 120, ptn_g_por_referencia: 4.4, cho_g_por_referencia: 21.3, lip_g_por_referencia: 1.9, fibra_g_por_referencia: 2.8, keywords: ['quinoa', 'grãos'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Tapioca', categoria: 'Cereais e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 352, ptn_g_por_referencia: 0.6, cho_g_por_referencia: 86.5, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.4, keywords: ['tapioca', 'goma'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
  ];

  await insertBatch(cereals);
};

// Seed: Leguminosas TACO
export const seedTacoLegumes = async () => {
  const legumes = [
    { nome: 'Feijão carioca cozido', categoria: 'Leguminosas', peso_referencia_g: 100, medida_padrao_referencia: '1 concha média', kcal_por_referencia: 77, ptn_g_por_referencia: 4.8, cho_g_por_referencia: 13.6, lip_g_por_referencia: 0.5, fibra_g_por_referencia: 8.5, keywords: ['feijão', 'carioca'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Feijão preto cozido', categoria: 'Leguminosas', peso_referencia_g: 100, medida_padrao_referencia: '1 concha média', kcal_por_referencia: 77, ptn_g_por_referencia: 4.5, cho_g_por_referencia: 14.0, lip_g_por_referencia: 0.5, fibra_g_por_referencia: 8.4, keywords: ['feijão', 'preto'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Grão-de-bico cozido', categoria: 'Leguminosas', peso_referencia_g: 100, medida_padrao_referencia: '4 colheres de sopa', kcal_por_referencia: 121, ptn_g_por_referencia: 6.5, cho_g_por_referencia: 18.8, lip_g_por_referencia: 2.1, fibra_g_por_referencia: 5.4, keywords: ['grão', 'bico', 'grão-de-bico'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Lentilha cozida', categoria: 'Leguminosas', peso_referencia_g: 100, medida_padrao_referencia: '4 colheres de sopa', kcal_por_referencia: 93, ptn_g_por_referencia: 6.3, cho_g_por_referencia: 16.0, lip_g_por_referencia: 0.5, fibra_g_por_referencia: 7.9, keywords: ['lentilha'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Ervilha em vagem crua', categoria: 'Leguminosas', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 54, ptn_g_por_referencia: 4.7, cho_g_por_referencia: 7.5, lip_g_por_referencia: 0.3, fibra_g_por_referencia: 3.7, keywords: ['ervilha', 'vagem'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
  ];

  await insertBatch(legumes);
};

// Seed: Verduras e Legumes TACO (24 itens)
export const seedTacoVegetables = async () => {
  const vegetables = [
    { nome: 'Abóbora cabotiá crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 30, ptn_g_por_referencia: 1.1, cho_g_por_referencia: 6.5, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.2, keywords: ['abóbora', 'cabotiã'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Abobrinha italiana crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade pequena', kcal_por_referencia: 19, ptn_g_por_referencia: 1.2, cho_g_por_referencia: 3.5, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 1.4, keywords: ['abobrinha', 'italiana'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Acelga crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '2 xícaras picada', kcal_por_referencia: 21, ptn_g_por_referencia: 1.8, cho_g_por_referencia: 3.7, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.5, keywords: ['acelga', 'folha'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Agrião cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '3 xícaras', kcal_por_referencia: 17, ptn_g_por_referencia: 2.8, cho_g_por_referencia: 1.9, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 1.9, keywords: ['agrião', 'folha'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Alface crespa crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '15 folhas', kcal_por_referencia: 11, ptn_g_por_referencia: 1.4, cho_g_por_referencia: 1.7, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 1.7, keywords: ['alface', 'crespa'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Berinjela crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '1/2 unidade média', kcal_por_referencia: 20, ptn_g_por_referencia: 0.8, cho_g_por_referencia: 4.4, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.9, keywords: ['berinjela'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Beterraba crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade pequena', kcal_por_referencia: 49, ptn_g_por_referencia: 1.9, cho_g_por_referencia: 11.1, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 3.4, keywords: ['beterraba'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Brócolis cozido', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '4 colheres de sopa', kcal_por_referencia: 25, ptn_g_por_referencia: 2.4, cho_g_por_referencia: 4.0, lip_g_por_referencia: 0.3, fibra_g_por_referencia: 3.0, keywords: ['brócolis', 'brocolis'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Cebola crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 38, ptn_g_por_referencia: 1.7, cho_g_por_referencia: 8.9, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.2, keywords: ['cebola'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Cenoura crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 34, ptn_g_por_referencia: 1.3, cho_g_por_referencia: 7.7, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 3.2, keywords: ['cenoura'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Chuchu cozido', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '4 colheres de sopa', kcal_por_referencia: 21, ptn_g_por_referencia: 0.9, cho_g_por_referencia: 4.5, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.7, keywords: ['chuchu'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Couve manteiga crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '2 xícaras picada', kcal_por_referencia: 27, ptn_g_por_referencia: 2.9, cho_g_por_referencia: 4.3, lip_g_por_referencia: 0.5, fibra_g_por_referencia: 3.1, keywords: ['couve', 'manteiga'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Couve-flor cozida', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '4 colheres de sopa', kcal_por_referencia: 23, ptn_g_por_referencia: 1.8, cho_g_por_referencia: 4.5, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.4, keywords: ['couve', 'flor'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Espinafre cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '3 xícaras', kcal_por_referencia: 17, ptn_g_por_referencia: 2.0, cho_g_por_referencia: 2.9, lip_g_por_referencia: 0.3, fibra_g_por_referencia: 2.1, keywords: ['espinafre'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Jiló cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '6 unidades', kcal_por_referencia: 38, ptn_g_por_referencia: 2.8, cho_g_por_referencia: 7.9, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 5.0, keywords: ['jiló'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Maxixe cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '8 unidades', kcal_por_referencia: 19, ptn_g_por_referencia: 1.0, cho_g_por_referencia: 4.2, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 2.3, keywords: ['maxixe'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Pepino japonês cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade pequena', kcal_por_referencia: 13, ptn_g_por_referencia: 0.9, cho_g_por_referencia: 2.4, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 0.9, keywords: ['pepino', 'japonês'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Pimentão verde cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 21, ptn_g_por_referencia: 0.9, cho_g_por_referencia: 4.9, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.6, keywords: ['pimentão', 'verde'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Quiabo cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '10 unidades', kcal_por_referencia: 30, ptn_g_por_referencia: 1.9, cho_g_por_referencia: 6.4, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 4.6, keywords: ['quiabo'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Rabanete cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '10 unidades', kcal_por_referencia: 12, ptn_g_por_referencia: 0.8, cho_g_por_referencia: 2.7, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.2, keywords: ['rabanete'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Repolho branco cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '2 xícaras picado', kcal_por_referencia: 22, ptn_g_por_referencia: 1.3, cho_g_por_referencia: 4.9, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.5, keywords: ['repolho', 'branco'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Rúcula crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '3 xícaras', kcal_por_referencia: 18, ptn_g_por_referencia: 2.1, cho_g_por_referencia: 2.7, lip_g_por_referencia: 0.5, fibra_g_por_referencia: 1.6, keywords: ['rúcula'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Tomate cru', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '4 fatias médias', kcal_por_referencia: 15, ptn_g_por_referencia: 1.1, cho_g_por_referencia: 3.1, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 1.2, keywords: ['tomate'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Vagem crua', categoria: 'Verduras e Legumes', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 25, ptn_g_por_referencia: 1.7, cho_g_por_referencia: 5.4, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 2.4, keywords: ['vagem'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
  ];

  await insertBatch(vegetables);
};

// Seed: Frutas TACO (27 itens)
export const seedTacoFruits = async () => {
  const fruits = [
    { nome: 'Abacate', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1/2 unidade média', kcal_por_referencia: 96, ptn_g_por_referencia: 1.2, cho_g_por_referencia: 6.0, lip_g_por_referencia: 8.4, fibra_g_por_referencia: 6.3, keywords: ['abacate'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Abacaxi cru', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 48, ptn_g_por_referencia: 0.9, cho_g_por_referencia: 12.3, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.0, keywords: ['abacaxi'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Açaí polpa congelada', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 copo pequeno', kcal_por_referencia: 58, ptn_g_por_referencia: 0.8, cho_g_por_referencia: 6.2, lip_g_por_referencia: 3.9, fibra_g_por_referencia: 2.6, keywords: ['açaí'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Acerola crua', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 33, ptn_g_por_referencia: 0.9, cho_g_por_referencia: 8.0, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 1.5, keywords: ['acerola'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Banana maçã', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 87, ptn_g_por_referencia: 1.8, cho_g_por_referencia: 22.3, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.6, keywords: ['banana', 'maçã'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Banana nanica', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 92, ptn_g_por_referencia: 1.5, cho_g_por_referencia: 23.8, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.9, keywords: ['banana', 'nanica'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Banana prata', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 98, ptn_g_por_referencia: 1.3, cho_g_por_referencia: 26.0, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.0, keywords: ['banana', 'prata'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Caju cru', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade grande', kcal_por_referencia: 43, ptn_g_por_referencia: 0.8, cho_g_por_referencia: 10.3, lip_g_por_referencia: 0.3, fibra_g_por_referencia: 1.7, keywords: ['caju'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Caqui', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 71, ptn_g_por_referencia: 0.6, cho_g_por_referencia: 19.3, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 6.5, keywords: ['caqui'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Goiaba branca', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1/2 unidade grande', kcal_por_referencia: 52, ptn_g_por_referencia: 1.1, cho_g_por_referencia: 13.0, lip_g_por_referencia: 0.4, fibra_g_por_referencia: 6.2, keywords: ['goiaba', 'branca'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Goiaba vermelha', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1/2 unidade grande', kcal_por_referencia: 54, ptn_g_por_referencia: 1.1, cho_g_por_referencia: 13.6, lip_g_por_referencia: 0.4, fibra_g_por_referencia: 6.3, keywords: ['goiaba', 'vermelha'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Jabuticaba crua', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 58, ptn_g_por_referencia: 0.6, cho_g_por_referencia: 15.3, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 2.3, keywords: ['jabuticaba'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Kiwi', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade grande', kcal_por_referencia: 51, ptn_g_por_referencia: 1.1, cho_g_por_referencia: 12.2, lip_g_por_referencia: 0.6, fibra_g_por_referencia: 2.7, keywords: ['kiwi'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Laranja bahia', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 45, ptn_g_por_referencia: 0.9, cho_g_por_referencia: 11.5, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.1, keywords: ['laranja', 'bahia'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Laranja pera', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 46, ptn_g_por_referencia: 1.0, cho_g_por_referencia: 11.7, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.8, keywords: ['laranja', 'pera'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Limão taiti', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '2 unidades', kcal_por_referencia: 29, ptn_g_por_referencia: 0.6, cho_g_por_referencia: 9.4, lip_g_por_referencia: 0.3, fibra_g_por_referencia: 0.5, keywords: ['limão', 'taiti'], tipo_refeicao_sugerida: ['Todas'], fonte: 'TACO' },
    { nome: 'Maçã fuji com casca', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 56, ptn_g_por_referencia: 0.3, cho_g_por_referencia: 15.2, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.3, keywords: ['maçã', 'fuji'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Mamão formosa', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 45, ptn_g_por_referencia: 0.8, cho_g_por_referencia: 11.6, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.8, keywords: ['mamão', 'formosa'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Mamão papaia', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1/2 unidade pequena', kcal_por_referencia: 40, ptn_g_por_referencia: 0.5, cho_g_por_referencia: 10.4, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 1.0, keywords: ['mamão', 'papaia'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Manga palmer', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1/2 unidade média', kcal_por_referencia: 51, ptn_g_por_referencia: 0.5, cho_g_por_referencia: 13.5, lip_g_por_referencia: 0.3, fibra_g_por_referencia: 1.6, keywords: ['manga', 'palmer'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Maracujá polpa', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1/2 xícara', kcal_por_referencia: 68, ptn_g_por_referencia: 1.8, cho_g_por_referencia: 16.5, lip_g_por_referencia: 0.4, fibra_g_por_referencia: 0.3, keywords: ['maracujá'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Melancia', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 33, ptn_g_por_referencia: 0.9, cho_g_por_referencia: 8.1, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 0.1, keywords: ['melancia'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Melão', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 29, ptn_g_por_referencia: 0.7, cho_g_por_referencia: 7.5, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 0.3, keywords: ['melão'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Morango', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '7 unidades médias', kcal_por_referencia: 30, ptn_g_por_referencia: 0.9, cho_g_por_referencia: 6.8, lip_g_por_referencia: 0.3, fibra_g_por_referencia: 1.7, keywords: ['morango'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Pera', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 53, ptn_g_por_referencia: 0.3, cho_g_por_referencia: 14.0, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 3.0, keywords: ['pera'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Tangerina cravo', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade grande', kcal_por_referencia: 38, ptn_g_por_referencia: 0.9, cho_g_por_referencia: 9.5, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 0.9, keywords: ['tangerina', 'cravo', 'mexerica'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Uva rubi', categoria: 'Frutas', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 64, ptn_g_por_referencia: 0.6, cho_g_por_referencia: 16.7, lip_g_por_referencia: 0.1, fibra_g_por_referencia: 0.9, keywords: ['uva', 'rubi'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
  ];

  await insertBatch(fruits);
};

// Seed: Carnes e Ovos TACO (13 itens)
export const seedTacoProteins = async () => {
  const proteins = [
    { nome: 'Peito de frango grelhado', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '1 filé médio', kcal_por_referencia: 159, ptn_g_por_referencia: 32.0, cho_g_por_referencia: 0, lip_g_por_referencia: 3.6, fibra_g_por_referencia: 0, keywords: ['frango', 'peito', 'grelhado'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Coxa de frango assada com pele', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '1 unidade média', kcal_por_referencia: 234, ptn_g_por_referencia: 20.4, cho_g_por_referencia: 0, lip_g_por_referencia: 16.6, fibra_g_por_referencia: 0, keywords: ['frango', 'coxa'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Carne bovina moída refogada', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '4 colheres de sopa', kcal_por_referencia: 186, ptn_g_por_referencia: 26.6, cho_g_por_referencia: 0, lip_g_por_referencia: 8.5, fibra_g_por_referencia: 0, keywords: ['carne', 'moída', 'bovina'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Contrafilé bovino grelhado', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '1 bife médio', kcal_por_referencia: 223, ptn_g_por_referencia: 28.9, cho_g_por_referencia: 0, lip_g_por_referencia: 11.2, fibra_g_por_referencia: 0, keywords: ['contrafilé', 'bife', 'bovina'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Filé mignon grelhado', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '1 bife médio', kcal_por_referencia: 191, ptn_g_por_referencia: 29.2, cho_g_por_referencia: 0, lip_g_por_referencia: 7.7, fibra_g_por_referencia: 0, keywords: ['filé', 'mignon', 'bovina'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Picanha bovina assada', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 287, ptn_g_por_referencia: 25.4, cho_g_por_referencia: 0, lip_g_por_referencia: 20.6, fibra_g_por_referencia: 0, keywords: ['picanha', 'bovina'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Carne de porco lombo assado', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 200, ptn_g_por_referencia: 29.3, cho_g_por_referencia: 0, lip_g_por_referencia: 8.7, fibra_g_por_referencia: 0, keywords: ['porco', 'lombo'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Costela de porco assada', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '2 pedaços', kcal_por_referencia: 290, ptn_g_por_referencia: 27.9, cho_g_por_referencia: 0, lip_g_por_referencia: 19.5, fibra_g_por_referencia: 0, keywords: ['porco', 'costela'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Ovo de galinha inteiro cozido', categoria: 'Carnes e Ovos', peso_referencia_g: 50, medida_padrao_referencia: '1 unidade', kcal_por_referencia: 77.5, ptn_g_por_referencia: 6.5, cho_g_por_referencia: 0.6, lip_g_por_referencia: 5.3, fibra_g_por_referencia: 0, keywords: ['ovo', 'cozido'], tipo_refeicao_sugerida: ['Café da Manhã', 'Almoço'], fonte: 'TACO' },
    { nome: 'Ovo de galinha frito', categoria: 'Carnes e Ovos', peso_referencia_g: 50, medida_padrao_referencia: '1 unidade', kcal_por_referencia: 107.5, ptn_g_por_referencia: 6.6, cho_g_por_referencia: 0.3, lip_g_por_referencia: 8.7, fibra_g_por_referencia: 0, keywords: ['ovo', 'frito'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
    { nome: 'Tilápia filé grelhado', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '1 filé médio', kcal_por_referencia: 96, ptn_g_por_referencia: 20.1, cho_g_por_referencia: 0, lip_g_por_referencia: 1.5, fibra_g_por_referencia: 0, keywords: ['tilápia', 'peixe', 'filé'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Salmão cru', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '1 filé médio', kcal_por_referencia: 211, ptn_g_por_referencia: 19.9, cho_g_por_referencia: 0, lip_g_por_referencia: 14.6, fibra_g_por_referencia: 0, keywords: ['salmão', 'peixe'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Atum fresco cru', categoria: 'Carnes e Ovos', peso_referencia_g: 100, medida_padrao_referencia: '1 filé médio', kcal_por_referencia: 118, ptn_g_por_referencia: 25.2, cho_g_por_referencia: 0, lip_g_por_referencia: 1.7, fibra_g_por_referencia: 0, keywords: ['atum', 'peixe'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
  ];

  await insertBatch(proteins);
};

// Seed: Leites e Derivados TACO (8 itens)
export const seedTacoDairy = async () => {
  const dairy = [
    { nome: 'Leite de vaca integral', categoria: 'Leites e Derivados', peso_referencia_g: 200, medida_padrao_referencia: '1 copo', kcal_por_referencia: 122, ptn_g_por_referencia: 5.8, cho_g_por_referencia: 9.0, lip_g_por_referencia: 6.6, fibra_g_por_referencia: 0, keywords: ['leite', 'vaca', 'integral'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
    { nome: 'Leite de vaca desnatado', categoria: 'Leites e Derivados', peso_referencia_g: 200, medida_padrao_referencia: '1 copo', kcal_por_referencia: 70, ptn_g_por_referencia: 6.8, cho_g_por_referencia: 9.8, lip_g_por_referencia: 0.2, fibra_g_por_referencia: 0, keywords: ['leite', 'desnatado'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
    { nome: 'Iogurte natural integral', categoria: 'Leites e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '1 pote pequeno', kcal_por_referencia: 51, ptn_g_por_referencia: 4.1, cho_g_por_referencia: 3.5, lip_g_por_referencia: 2.3, fibra_g_por_referencia: 0, keywords: ['iogurte', 'natural'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Iogurte natural desnatado', categoria: 'Leites e Derivados', peso_referencia_g: 100, medida_padrao_referencia: '1 pote pequeno', kcal_por_referencia: 41, ptn_g_por_referencia: 4.3, cho_g_por_referencia: 5.4, lip_g_por_referencia: 0.3, fibra_g_por_referencia: 0, keywords: ['iogurte', 'desnatado'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Queijo minas frescal', categoria: 'Leites e Derivados', peso_referencia_g: 30, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 69, ptn_g_por_referencia: 5.1, cho_g_por_referencia: 1.0, lip_g_por_referencia: 5.1, fibra_g_por_referencia: 0, keywords: ['queijo', 'minas'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Queijo mussarela', categoria: 'Leites e Derivados', peso_referencia_g: 30, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 84, ptn_g_por_referencia: 6.0, cho_g_por_referencia: 0.9, lip_g_por_referencia: 6.3, fibra_g_por_referencia: 0, keywords: ['queijo', 'mussarela'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Queijo prato', categoria: 'Leites e Derivados', peso_referencia_g: 30, medida_padrao_referencia: '1 fatia média', kcal_por_referencia: 107, ptn_g_por_referencia: 7.2, cho_g_por_referencia: 1.5, lip_g_por_referencia: 8.1, fibra_g_por_referencia: 0, keywords: ['queijo', 'prato'], tipo_refeicao_sugerida: ['Café da Manhã', 'Lanche'], fonte: 'TACO' },
    { nome: 'Requeijão cremoso', categoria: 'Leites e Derivados', peso_referencia_g: 30, medida_padrao_referencia: '1 colher de sopa', kcal_por_referencia: 83, ptn_g_por_referencia: 2.7, cho_g_por_referencia: 0.9, lip_g_por_referencia: 7.8, fibra_g_por_referencia: 0, keywords: ['requeijão'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
  ];

  await insertBatch(dairy);
};

// Seed: Óleos e Gorduras TACO (3 itens)
export const seedTacoFatsOils = async () => {
  const fats = [
    { nome: 'Azeite de oliva extra virgem', categoria: 'Óleos e Gorduras', peso_referencia_g: 13, medida_padrao_referencia: '1 colher de sopa', kcal_por_referencia: 115, ptn_g_por_referencia: 0, cho_g_por_referencia: 0, lip_g_por_referencia: 13.0, fibra_g_por_referencia: 0, keywords: ['azeite', 'oliva'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Óleo de soja', categoria: 'Óleos e Gorduras', peso_referencia_g: 13, medida_padrao_referencia: '1 colher de sopa', kcal_por_referencia: 115, ptn_g_por_referencia: 0, cho_g_por_referencia: 0, lip_g_por_referencia: 13.0, fibra_g_por_referencia: 0, keywords: ['óleo', 'soja'], tipo_refeicao_sugerida: ['Almoço', 'Jantar'], fonte: 'TACO' },
    { nome: 'Manteiga com sal', categoria: 'Óleos e Gorduras', peso_referencia_g: 10, medida_padrao_referencia: '1 colher de chá', kcal_por_referencia: 74, ptn_g_por_referencia: 0.1, cho_g_por_referencia: 0, lip_g_por_referencia: 8.2, fibra_g_por_referencia: 0, sodio_mg_por_referencia: 79, keywords: ['manteiga'], tipo_refeicao_sugerida: ['Café da Manhã'], fonte: 'TACO' },
  ];

  await insertBatch(fats);
};

// Seed: Oleaginosas TACO (5 itens)
export const seedTacoNutsSeeds = async () => {
  const nuts = [
    { nome: 'Amendoim torrado sem sal', categoria: 'Oleaginosas', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 544, ptn_g_por_referencia: 27.2, cho_g_por_referencia: 20.3, lip_g_por_referencia: 43.9, fibra_g_por_referencia: 8.0, keywords: ['amendoim'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Castanha de caju torrada sem sal', categoria: 'Oleaginosas', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 570, ptn_g_por_referencia: 18.5, cho_g_por_referencia: 28.7, lip_g_por_referencia: 46.3, fibra_g_por_referencia: 3.7, keywords: ['castanha', 'caju'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Castanha do Pará', categoria: 'Oleaginosas', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 643, ptn_g_por_referencia: 14.5, cho_g_por_referencia: 15.1, lip_g_por_referencia: 63.5, fibra_g_por_referencia: 7.9, keywords: ['castanha', 'pará', 'brasil'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Amêndoa torrada sem sal', categoria: 'Oleaginosas', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 640, ptn_g_por_referencia: 19.6, cho_g_por_referencia: 20.8, lip_g_por_referencia: 57.7, fibra_g_por_referencia: 11.6, keywords: ['amêndoa'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
    { nome: 'Nozes', categoria: 'Oleaginosas', peso_referencia_g: 100, medida_padrao_referencia: '1 xícara', kcal_por_referencia: 654, ptn_g_por_referencia: 15.2, cho_g_por_referencia: 13.7, lip_g_por_referencia: 65.2, fibra_g_por_referencia: 6.7, keywords: ['nozes'], tipo_refeicao_sugerida: ['Lanche'], fonte: 'TACO' },
  ];

  await insertBatch(nuts);
};

// Master seed function
export const seedAllFoods = async () => {
  try {
    console.log('🌱 Starting comprehensive food database seeding...\n');
    
    await seedEssentialFoods();
    await seedVegetables();
    await seedFruits();
    await seedDairy();
    await seedMoreProteins();
    await seedNutsAndSeeds();
    await seedFatsAndOils();
    await seedMoreCereals();
    await seedMoreLegumes();
    
    // NOVOS SEEDS TACO (200+ alimentos brasileiros)
    await seedTacoCereals();
    await seedTacoLegumes();
    await seedTacoVegetables();
    await seedTacoFruits();
    await seedTacoProteins();
    await seedTacoDairy();
    await seedTacoFatsOils();
    await seedTacoNutsSeeds();
    
    console.log('\n✨ Successfully seeded complete food database with 200+ TACO foods!');
  } catch (error) {
    console.error('❌ Error in master seed function:', error);
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

    // If less than 50 foods, we need to seed
    return (count || 0) < 50;
  } catch (error) {
    console.error('Error checking seed status:', error);
    return true; // Default to needing seed on error
  }
};
