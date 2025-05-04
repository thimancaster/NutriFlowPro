
import React from 'react';
import DashboardTestimonials from '@/components/DashboardTestimonials';
import { getTestimonials } from '@/utils/seedTestimonials';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

const TestimonialsSection = () => {
  const { toast } = useToast();

  // Função para garantir que depoimentos sejam exibidos
  const handleLoadTestimonials = async () => {
    try {
      // Isso agora apenas vai acionar o componente para usar o fallback
      toast({
        title: "Sucesso",
        description: "Depoimentos de exemplo carregados com sucesso",
      });
      window.location.reload(); // Recarregar a página para mostrar os depoimentos
    } catch (error) {
      console.error("Erro ao carregar depoimentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os depoimentos de exemplo",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">O que dizem nossos usuários</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nutricionistas que transformaram sua prática com o NutriFlow Pro
          </p>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLoadTestimonials}
              className="mx-auto"
            >
              Carregar depoimentos de exemplo
            </Button>
          </div>
        </div>
        
        <DashboardTestimonials />
      </div>
    </section>
  );
};

export default TestimonialsSection;
