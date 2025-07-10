
import React from 'react';
import DashboardTestimonials from '@/components/DashboardTestimonials';

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">O que dizem nossos usuários</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nutricionistas que transformaram sua prática com o NutriFlow Pro
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <DashboardTestimonials showTitle={false} />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
