
import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTestimonials } from '@/utils/seedTestimonials';
import StarRating from '../StarRating';

interface Testimonial {
  id?: string;
  name: string;
  role: string;
  content: string;
  approved?: boolean;
  rating?: number;
}

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fallbackTestimonials, setFallbackTestimonials] = useState<Testimonial[]>([]);

  // Setup autoplay plugin with same config as dashboard
  const autoplayOptions = {
    delay: 10000, // 10 seconds per slide (same as dashboard)
    stopOnInteraction: true,
    rootNode: (emblaRoot: any) => emblaRoot.parentElement,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
    },
    [Autoplay(autoplayOptions)]
  );

  // Immediately use testimonial fallbacks
  useEffect(() => {
    setFallbackTestimonials(getTestimonials());
  }, []);

  // Load testimonials from database with same logic as dashboard
  const {
    data: dbTestimonials,
    isLoading,
    error,
  } = useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      try {
        // Fetch all approved testimonials (no limit)
        const { data, error } = await supabase
          .from("testimonials")
          .select("id,name,role,content,approved,rating")
          .eq("approved", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Error fetching testimonials:", error);
          return [];
        }

        return data || [];
      } catch (err) {
        console.warn("Error in testimonial query:", err);
        return [];
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

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

  // Determine which testimonials to show: database or fallback
  const testimonials =
    dbTestimonials && dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials;

  if (isLoading && fallbackTestimonials.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-glow-hover">O que dizem nossos usuários</h2>
            <p className="text-lg text-gray-800 max-w-3xl mx-auto">
              Carregando depoimentos...
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-glow-hover">O que dizem nossos usuários</h2>
          <p className="text-lg text-gray-800 max-w-3xl mx-auto">
            Nutricionistas que transformaram sua prática com o NutriFlow Pro
          </p>
        </motion.div>
        
        {testimonials && testimonials.length > 0 ? (
          <div className="max-w-5xl mx-auto relative">
            {/* Gradient masks for fade effect on sides */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex py-6 px-2">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id || index}
                    className="min-w-0 flex-[0_0_90%] md:flex-[0_0_45%] lg:flex-[0_0_33.333%] mx-2">
                    <motion.div 
                      className={`glass-card rounded-2xl p-8 backdrop-blur-sm border border-white/20 hover-lift transition-all duration-500 h-full ${
                        index === activeIndex
                          ? "scale-105 shadow-xl"
                          : "scale-95 opacity-70"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="mb-4">
                        <StarRating rating={testimonial.rating || 5} />
                      </div>
                      <p className={`text-gray-800 mb-4 italic ${
                        index === activeIndex ? "text-gray-800" : "text-gray-600"
                      }`}>
                        "{testimonial.content}"
                      </p>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-700">{testimonial.role}</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'bg-nutri-blue scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir para depoimento ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum depoimento encontrado</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
