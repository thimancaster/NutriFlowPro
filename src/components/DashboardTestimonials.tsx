
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { forceSeedTestimonials, getTestimonials } from '@/utils/seedTestimonials';
import StarRating from './StarRating';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Testimonial {
  id?: string;
  name: string;
  role: string;
  content: string;
  approved?: boolean;
  rating?: number;
}

interface DashboardTestimonialsProps {
  showTitle?: boolean;
}

const DashboardTestimonials: React.FC<DashboardTestimonialsProps> = ({ showTitle = true }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fallbackTestimonials, setFallbackTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Setup autoplay plugin
  const autoplayOptions = {
    delay: 7000, // 7 seconds per slide for reading time
    stopOnInteraction: true, // Stop on user interaction
    rootNode: (emblaRoot: any) => emblaRoot.parentElement, // Needed for proper functioning
  };
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  }, [Autoplay(autoplayOptions)]);
  
  // Update active index when slide changes
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);
  
  // Carrega os depoimentos do banco de dados
  const { data: dbTestimonials, isLoading, error, refetch } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      console.log('Fetching testimonials from database...');
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching testimonials:', error);
        throw new Error('Erro ao carregar depoimentos do banco');
      }

      console.log('Testimonials fetched from database:', data?.length || 0);
      return data || [];
    },
    retry: 3,
    staleTime: 60000, // 1 minute
  });

  // Usar depoimentos de fallback caso o banco de dados não tenha dados - carrega automaticamente
  useEffect(() => {
    if ((dbTestimonials && dbTestimonials.length === 0) || error) {
      console.log('Using fallback testimonials since database returned no data');
      setFallbackTestimonials(getTestimonials());
      
      // Tenta semear os depoimentos automaticamente sem exibir toast
      forceSeedTestimonials().catch(err => {
        console.error('Error auto-seeding testimonials:', err);
      });
    }
  }, [dbTestimonials, error]);

  // Determina quais depoimentos mostrar: banco de dados ou fallback
  const testimonials = (dbTestimonials && dbTestimonials.length > 0) 
    ? dbTestimonials 
    : fallbackTestimonials;

  const handleAddTestimonial = () => {
    navigate('/add-testimonial');
  };

  if (isLoading && fallbackTestimonials.length === 0) {
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
      {showTitle && (
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
      )}
      <CardContent>
        {testimonials && testimonials.length > 0 ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex py-4">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id || index}
                  className={`min-w-0 flex-[0_0_90%] md:flex-[0_0_45%] mx-2 transition-all duration-500 ${
                    index === activeIndex
                      ? "scale-105 z-10 shadow-lg bg-white"
                      : "scale-95 opacity-70 bg-white/90"
                  }`}
                >
                  <div className={`p-6 rounded-lg ${
                    index === activeIndex
                      ? "shadow-xl"
                      : "shadow-md"
                  }`}>
                    <div className="mb-3">
                      <StarRating rating={testimonial.rating || 5} />
                    </div>
                    <p className={`italic text-gray-600 mb-4 ${
                      index === activeIndex
                        ? "text-gray-800"
                        : "text-gray-600"
                    }`}>&quot;{testimonial.content}&quot;</p>
                    <p className="font-medium text-nutri-blue">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum depoimento encontrado</p>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={handleAddTestimonial}
              >
                Seja o primeiro a deixar um depoimento
              </Button>
            </div>
          </div>
        )}
        
        {testimonials && testimonials.length > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full h-8 w-8 border-nutri-blue text-nutri-blue"
              onClick={() => emblaApi?.scrollPrev()}
            >
              <span className="sr-only">Anterior</span>
              ←
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full h-8 w-8 border-nutri-blue text-nutri-blue"
              onClick={() => emblaApi?.scrollNext()}
            >
              <span className="sr-only">Próximo</span>
              →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardTestimonials;
