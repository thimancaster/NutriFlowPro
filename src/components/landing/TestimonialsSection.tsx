
import React from 'react';
import DashboardTestimonials from '@/components/DashboardTestimonials';
import { forceSeedTestimonials } from '@/utils/seedTestimonials';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

const TestimonialsSection = () => {
  const { toast } = useToast();

  // Function to handle manually seeding testimonials if needed
  const handleSeedTestimonials = async () => {
    try {
      await forceSeedTestimonials();
      toast({
        title: "Sucesso",
        description: "Depoimentos de exemplo adicionados com sucesso",
      });
      window.location.reload(); // Refresh the page to show the new testimonials
    } catch (error) {
      console.error("Erro ao adicionar depoimentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar os depoimentos de exemplo",
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
              onClick={handleSeedTestimonials}
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
