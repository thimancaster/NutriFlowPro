
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
}

const DashboardTestimonials: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: testimonials, isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching testimonials:', error);
        throw new Error('Erro ao carregar depoimentos');
      }

      return data || [];
    },
    retry: 3,
    staleTime: 60000, // 1 minute
  });

  const handleAddTestimonial = () => {
    navigate('/add-testimonial');
  };

  if (error) {
    return (
      <Card className="nutri-card shadow-lg border-none bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle>Depoimentos</CardTitle>
          <CardDescription>Não foi possível carregar os depoimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="nutri-card shadow-lg border-none bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle>Carregando depoimentos...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="nutri-card shadow-lg border-none bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-red-500 mr-2" /> Depoimentos de Usuários
          </div>
          <Button 
            variant="outline" 
            className="text-nutri-blue hover:bg-nutri-blue hover:text-white transition-colors"
            onClick={handleAddTestimonial}
          >
            Adicionar Depoimento
          </Button>
        </CardTitle>
        <CardDescription>O que os nutricionistas estão dizendo sobre o NutriFlow Pro</CardDescription>
      </CardHeader>
      <CardContent>
        {testimonials && testimonials.length > 0 ? (
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="italic text-gray-600 mb-4">&quot;{testimonial.content}&quot;</p>
                    <p className="font-medium text-nutri-blue">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex">
              <CarouselPrevious className="-left-4" />
              <CarouselNext className="-right-4" />
            </div>
          </Carousel>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum depoimento encontrado</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleAddTestimonial}
            >
              Seja o primeiro a deixar um depoimento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardTestimonials;
