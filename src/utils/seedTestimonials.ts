
import { supabase } from "@/integrations/supabase/client";

// Array of pre-created testimonials
const testimonials = [
  {
    name: "Dra. Mariana Silva",
    role: "Nutricionista Clínica",
    content: "O NutriFlow Pro revolucionou minha prática clínica. Reduzi o tempo de planejamento de dietas em 70% e melhorei a adesão dos pacientes aos planos alimentares. O retorno sobre o investimento foi imediato!",
    approved: true
  },
  {
    name: "Dr. Rafael Mendes",
    role: "Nutricionista Esportivo",
    content: "Atendo mais de 40 atletas semanalmente e o NutriFlow Pro tornou isso possível. A função de visualização de progresso é o que mais impressiona meus clientes e aumentou minha taxa de retenção em 85%.",
    approved: true
  },
  {
    name: "Dra. Camila Rodrigues",
    role: "Nutricionista Funcional",
    content: "Desde que comecei a usar o NutriFlow Pro, consegui aumentar meus honorários em 30%. Meus pacientes percebem o valor agregado dos relatórios personalizados e da abordagem profissional proporcionada pela plataforma.",
    approved: true
  },
  {
    name: "Dr. João Paulo",
    role: "Nutricionista Pediátrico",
    content: "A interface visual do NutriFlow Pro é perfeita para explicar planos alimentares às crianças e seus pais. Consegui ampliar minha clínica e contratar dois assistentes graças ao aumento de 45% na minha eficiência.",
    approved: true
  },
  {
    name: "Dra. Fernanda Costa",
    role: "Nutricionista Corporativa",
    content: "Gerencio programas de saúde para mais de 200 funcionários de uma multinacional. O NutriFlow Pro me permitiu escalar o atendimento sem perder qualidade, gerando métricas impressionantes que garantiram a renovação do meu contrato.",
    approved: true
  },
  {
    name: "Dr. Gustavo Almeida",
    role: "Nutricionista Clínico e Pesquisador",
    content: "A capacidade de coletar e analisar dados antropométricos do NutriFlow Pro revolucionou minha pesquisa. Além disso, meu consultório agora está sempre lotado graças aos resultados consistentes que consigo entregar.",
    approved: true
  },
  {
    name: "Dra. Juliana Ferreira",
    role: "Nutricionista Comportamental",
    content: "Meus pacientes com transtornos alimentares tiveram uma melhora de 62% na adesão aos planos desde que comecei a usar o NutriFlow Pro. A visualização clara do progresso é motivadora e transformadora para eles.",
    approved: true
  },
  {
    name: "Dr. Lucas Moreira",
    role: "Nutricionista Esportivo de Alto Rendimento",
    content: "Trabalho com atletas olímpicos e o NutriFlow Pro é minha ferramenta essencial. A precisão dos cálculos e a facilidade de ajustes em tempo real já ajudaram vários de meus atletas a conquistarem medalhas nacionais.",
    approved: true
  },
  {
    name: "Dra. Beatriz Santos",
    role: "Nutricionista Materno-infantil",
    content: "Como especialista em nutrição gestacional, preciso de ferramentas confiáveis. O NutriFlow Pro me permite oferecer um acompanhamento detalhado que fez minha lista de espera crescer para 3 meses. Valeu cada centavo investido!",
    approved: true
  },
  {
    name: "Dr. Henrique Lima",
    role: "Nutricionista Hospitalar",
    content: "Implementei o NutriFlow Pro no departamento de nutrição do hospital e conseguimos reduzir o tempo médio de internação em 12% graças à otimização dos planos nutricionais. A diretoria ficou tão impressionada que expandiu nossa equipe.",
    approved: true
  }
];

// Exportando os depoimentos para uso direto quando precisar
export const getTestimonials = () => testimonials;

// Function to insert testimonials to the database (tentativa)
export const seedTestimonials = async () => {
  console.log('Attempting to seed testimonials...');
  // Esta função tenta inserir os depoimentos mas pode não funcionar devido às políticas RLS
  try {
    // Primeiro verifica se existem depoimentos na tabela
    const { data: existingTestimonials, error: countError } = await supabase
      .from('testimonials')
      .select('id');
    
    if (countError) {
      console.error('Error checking existing testimonials:', countError);
      return;
    }
    
    if (!existingTestimonials || existingTestimonials.length === 0) {
      console.log('No testimonials found, seeding the table...');
      
      // Tentativa de inserção com autenticação necessária
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonials);
        
      if (error) {
        console.error('Error seeding testimonials:', error);
      } else {
        console.log('Successfully seeded testimonials, count:', testimonials.length);
      }
    } else {
      console.log('Testimonials already exist, count:', existingTestimonials.length);
    }
  } catch (error) {
    console.error('Error in seedTestimonials:', error);
  }
};

// Function to force seed testimonials (for manual call if needed)
export const forceSeedTestimonials = async () => {
  console.log('Force seeding testimonials...');
  try {
    // Delete existing testimonials first (esta operação também pode falhar devido a RLS)
    const { error: deleteError } = await supabase
      .from('testimonials')
      .delete()
      .gte('id', '0');
    
    if (deleteError) {
      console.error('Error deleting existing testimonials:', deleteError);
    }
    
    // Insert new testimonials
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonials);
      
    if (error) {
      console.error('Error force seeding testimonials:', error);
    } else {
      console.log('Successfully force seeded testimonials');
    }
  } catch (error) {
    console.error('Error in forceSeedTestimonials:', error);
  }
};
