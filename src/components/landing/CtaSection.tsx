
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CtaSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-blue-50/30 to-green-50 relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-transparent to-blue-100/30 pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-overlay rounded-2xl p-8 md:p-12 mx-auto max-w-4xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Pronto para transformar sua prática?</h2>
          <p className="text-lg text-gray-800 max-w-3xl mx-auto mb-8">
            Junte-se a milhares de nutricionistas que já estão usando o NutriFlow Pro para otimizar seu trabalho e melhorar os resultados dos pacientes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                variant="subscription-green"
                animation="shimmer"
                className="px-8 py-6 text-lg font-semibold w-full sm:w-auto magnetic-hover ripple-effect colored-shadow-lift group"
              >
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="nutri-blue"
                animation="shimmer"
                className="px-8 py-6 text-lg font-semibold w-full sm:w-auto magnetic-hover ripple-effect colored-shadow-lift"
              >
                Fazer Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
