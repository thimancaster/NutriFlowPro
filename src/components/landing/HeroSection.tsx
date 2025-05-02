
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-nutri-green">Nutri</span>
              <span className="text-nutri-blue">Flow Pro</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-700 mb-6">
              Sistema completo de gestão para nutricionistas
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Transforme sua prática nutricional com nossa plataforma completa. Gerencie pacientes, crie planos alimentares personalizados e acompanhe resultados em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button 
                  className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90 text-white font-medium px-8 py-6 text-lg w-full sm:w-auto"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="border-nutri-blue text-nutri-blue hover:bg-nutri-blue hover:text-white px-8 py-6 text-lg w-full sm:w-auto"
                >
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80"
              alt="Nutricionista trabalhando"
              className="rounded-xl shadow-2xl w-full"
              fallbackSrc="/placeholder.svg"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
