
import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
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

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">O que dizem nossos usuários</h2>
          <p className="text-lg text-gray-800 max-w-3xl mx-auto">
            Nutricionistas que transformaram sua prática com o NutriFlow Pro
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-800 mb-4 italic">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-700">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
