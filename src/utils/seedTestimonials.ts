
import { supabase } from "@/integrations/supabase/client";

// Array of pre-created testimonials
const testimonials = [
  {
    name: "Dra. Mariana Silva",
    role: "Nutricionista Clínica",
    content: "O NutriFlow Pro revolucionou minha prática clínica. Consigo gerenciar pacientes, criar planos e acompanhar resultados em uma única plataforma.",
    approved: true
  },
  {
    name: "Dr. Rafael Mendes",
    role: "Nutricionista Esportivo",
    content: "A funcionalidade de avaliação antropométrica é sensacional! Meus atletas conseguem visualizar o progresso claramente e isso aumenta a adesão ao plano alimentar.",
    approved: true
  },
  {
    name: "Dra. Camila Rodrigues",
    role: "Nutricionista Funcional",
    content: "O gerador de planos alimentares economiza horas do meu trabalho semanal. Personalizar dietas nunca foi tão rápido e eficiente.",
    approved: true
  },
  {
    name: "Dr. João Paulo",
    role: "Nutricionista Pediátrico",
    content: "A interface amigável facilita muito a explicação dos planos para os pais dos meus pacientes. O feedback tem sido excelente!",
    approved: true
  },
  {
    name: "Dra. Fernanda Costa",
    role: "Nutricionista de Empresa",
    content: "Uso o NutriFlow Pro para gerenciar mais de 200 funcionários em programas de saúde corporativa. As métricas e relatórios são fundamentais para demonstrar resultados.",
    approved: true
  },
  {
    name: "Dr. Gustavo Almeida",
    role: "Nutricionista Clínico",
    content: "A capacidade de acompanhar as mudanças em medidas antropométricas ao longo do tempo é fantástica para motivar meus pacientes.",
    approved: true
  },
  {
    name: "Dra. Juliana Ferreira",
    role: "Nutricionista Comportamental",
    content: "O sistema de histórico de consultas me permite revisar facilmente o progresso de cada paciente, tornando minhas consultas muito mais produtivas.",
    approved: true
  },
  {
    name: "Dr. Lucas Moreira",
    role: "Nutricionista Esportivo",
    content: "Os cálculos automatizados de IMC, RCQ e porcentagem de gordura me fazem ganhar um tempo precioso em cada avaliação.",
    approved: true
  },
  {
    name: "Dra. Beatriz Santos",
    role: "Nutricionista Materno-infantil",
    content: "O NutriFlow Pro é uma ferramenta completa que integra todos os aspectos da nutrição. Não consigo imaginar meu consultório sem ele agora.",
    approved: true
  },
  {
    name: "Dr. Henrique Lima",
    role: "Nutricionista Hospitalar",
    content: "A facilidade de acesso aos dados dos pacientes e a interface intuitiva tornam o NutriFlow Pro uma ferramenta essencial para qualquer profissional de nutrição.",
    approved: true
  }
];

// Function to insert testimonials to the database
export const seedTestimonials = async () => {
  try {
    const { data: existingTestimonials, error: countError } = await supabase
      .from('testimonials')
      .select('id');
    
    if (countError) {
      console.error('Error checking existing testimonials:', countError);
      return;
    }
    
    // Only seed if no testimonials exist
    if (existingTestimonials && existingTestimonials.length === 0) {
      const { error } = await supabase
        .from('testimonials')
        .insert(testimonials);
        
      if (error) {
        console.error('Error seeding testimonials:', error);
      } else {
        console.log('Successfully seeded 10 testimonials');
      }
    } else {
      console.log('Testimonials already exist, skipping seeding');
    }
  } catch (error) {
    console.error('Error in seedTestimonials:', error);
  }
};
