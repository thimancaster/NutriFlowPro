
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CtaSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-nutri-green/10 to-nutri-blue/10">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para transformar sua prática?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Junte-se a milhares de nutricionistas que já estão usando o NutriFlow Pro para otimizar seu trabalho e melhorar os resultados dos pacientes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90 text-white font-medium px-8 py-6 text-lg"
              >
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="outline" 
                className="border-nutri-blue text-nutri-blue hover:bg-nutri-blue hover:text-white px-8 py-6 text-lg"
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
