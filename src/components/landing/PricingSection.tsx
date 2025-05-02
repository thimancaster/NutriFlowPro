
import React from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const PricingSection = () => {
  return (
    <section className="py-16 md:py-24 bg-blue-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos para cada necessidade</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Escolha o plano ideal para o seu perfil profissional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Básico</h3>
              <p className="text-nutri-blue text-lg font-medium">Gratuito</p>
              <p className="text-gray-500 mt-2">Ideal para começar</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Calculadora nutricional básica</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Controle de 10 pacientes</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Criação de planos alimentares simples</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Histórico básico de consultas</span>
              </li>
            </ul>
            
            <Link to="/signup">
              <Button 
                className="w-full bg-nutri-blue text-white hover:bg-nutri-blue-dark transition-colors"
              >
                Começar Gratuitamente
              </Button>
            </Link>
          </motion.div>
          
          {/* Premium Plan */}
          <motion.div 
            className="bg-gradient-to-br from-nutri-blue to-nutri-blue-dark rounded-xl shadow-lg p-8 border border-blue-400 transform hover:scale-105 transition-transform"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-6">
              <div className="flex justify-center items-center mb-2">
                <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                <h3 className="text-2xl font-bold text-white ml-2">Plano Premium</h3>
              </div>
              <p className="text-white text-lg font-medium">R$ 97,00 <span className="text-sm font-normal">/mês</span></p>
              <p className="text-blue-100 mt-2">Recursos completos</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="text-white">Calculadora nutricional avançada</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="text-white">Controle ilimitado de pacientes</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="text-white">IA para criação de planos alimentares</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="text-white">Histórico completo de consultas</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="text-white">Exportação de relatórios em PDF</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="text-white">Suporte premium 24/7</span>
              </li>
            </ul>
            
            <Link to="/signup?plan=premium">
              <Button 
                className="w-full bg-white text-nutri-blue hover:bg-nutri-gray-light transition-colors"
              >
                Assinar Premium
              </Button>
            </Link>
            
            <p className="text-center text-blue-100 text-sm mt-4">
              7 dias de garantia de devolução do dinheiro
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
