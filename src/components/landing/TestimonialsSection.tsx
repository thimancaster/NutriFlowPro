
import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const testimonials = [
    {
      name: "Dra. Marina Santos",
      role: "Nutricionista Clínica",
      content: "O NutriFlow Pro revolucionou minha prática! Economizo pelo menos 3 horas por dia com os cálculos automáticos e a organização dos pacientes.",
      rating: 5
    },
    {
      name: "Dr. Carlos Oliveira",
      role: "Nutricionista Esportivo",
      content: "A calculadora de macronutrientes é extremamente precisa. Meus atletas estão vendo resultados muito melhores com os planos personalizados.",
      rating: 5
    },
    {
      name: "Dra. Ana Ferreira",
      role: "Nutricionista Materno-Infantil",
      content: "Interface intuitiva e funcionalidades completas. Consegui organizar todo meu consultório em uma única plataforma.",
      rating: 5
    }
  ];

  // Setup autoplay plugin
  const autoplayOptions = {
    delay: 8000, // 8 seconds per slide
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
        
        <div className="max-w-5xl mx-auto relative">
          {/* Gradient masks for fade effect on sides */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex py-6 px-2">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
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
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 float-hover" />
                      ))}
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
      </div>
    </section>
  );
};

export default TestimonialsSection;
