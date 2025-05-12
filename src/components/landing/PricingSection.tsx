
import React, { useEffect } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const PricingSection = () => {
  useEffect(() => {
    // Add Hotmart checkout script
    const script = document.createElement('script');
    script.src = 'https://static.hotmart.com/checkout/widget.min.js';
    script.async = true;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
    
    document.head.appendChild(script);
    document.head.appendChild(link);
    
    return () => {
      // Cleanup
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-blue-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos para cada necessidade</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Escolha o plano ideal para o seu perfil profissional
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          {/* Plano Mensal */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 w-full md:w-[calc(50%-1rem)] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Mensal</h3>
              <p className="text-nutri-blue text-2xl font-bold mt-4">R$ 57,90<span className="text-base font-normal ml-1">/mês</span></p>
            </div>
            
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Controle ilimitado de pacientes</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">IA para criação de planos alimentares</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Histórico completo de consultas</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Exportação de relatórios em PDF</span>
              </li>
            </ul>
            
            <div className="mt-auto">
              <a 
                href="https://pay.hotmart.com/COD_MONTHLY?checkoutMode=2" 
                className="w-full bg-nutri-blue text-white py-3 px-6 rounded-lg font-medium inline-flex justify-center items-center hover:bg-nutri-blue-dark transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Assinar Mensal
              </a>
            </div>
          </motion.div>
          
          {/* Plano Anual - Com desconto */}
          <motion.div 
            className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl p-8 border-2 border-nutri-blue relative w-full md:w-[calc(50%-1rem)] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="absolute -top-4 right-4 bg-nutri-green text-white text-sm px-3 py-1 rounded-full font-medium">
              ECONOMIA DE 20%
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Anual</h3>
              <p className="text-nutri-blue text-2xl font-bold mt-4">R$ 557,00<span className="text-base font-normal ml-1">/ano</span></p>
              <p className="text-sm text-gray-500 mt-1">(equivale a R$ 46,42/mês)</p>
            </div>
            
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Controle ilimitado de pacientes</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">IA para criação de planos alimentares</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Histórico completo de consultas</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Exportação de relatórios em PDF</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Suporte premium prioritário</span>
              </li>
            </ul>
            
            <div className="mt-auto">
              <a 
                href="https://pay.hotmart.com/C99693448A?checkoutMode=2" 
                className="hotmart-fb hotmart__button-checkout w-full bg-nutri-green text-white py-3 px-6 rounded-lg font-medium inline-flex justify-center items-center hover:bg-green-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Assinar Anual (Recomendado)
              </a>
            </div>
          </motion.div>
        </div>
        
        <div className="text-center mt-10 text-gray-500 text-sm">
          <p>Acesso imediato após a confirmação do pagamento</p>
          <p className="mt-2">7 dias de garantia de devolução do dinheiro</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
