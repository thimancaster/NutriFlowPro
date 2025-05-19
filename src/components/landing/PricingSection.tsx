import React, { useEffect } from 'react';
import { CheckCircle, Star, Shield, Award, Zap, BookOpen, FileText, Badge, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { SUBSCRIPTION_PRICES } from '@/constants/subscriptionConstants';

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

  const importHotmart = () => {
    // This function is already handled in the useEffect
    console.log('Hotmart scripts already loaded');
  };

  return (
    <section className="py-16 md:py-24 bg-blue-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos para cada necessidade</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Escolha o plano ideal para o seu perfil profissional
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {/* Plano Free */}
          <motion.div 
            className="bg-white rounded-xl shadow-md p-8 border border-gray-200 w-full md:w-[calc(33%-1rem)] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Free</h3>
              <p className="text-nutri-blue text-2xl font-bold mt-4">Gratuito</p>
              <p className="text-gray-500 mt-2">Acesso básico</p>
            </div>
            
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Cadastro de até 10 pacientes</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Calculadora nutricional básica</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Histórico básico de consultas</span>
              </li>
            </ul>
            
            <div className="mt-auto">
              <Button 
                variant="outline" 
                className="w-full" 
                asChild
              >
                <Link to="/signup">
                  Comece Agora
                </Link>
              </Button>
            </div>
          </motion.div>
          
          {/* Plano Mensal */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 w-full md:w-[calc(33%-1rem)] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Mensal</h3>
              <p className="text-nutri-blue text-2xl font-bold mt-4">{SUBSCRIPTION_PRICES.MONTHLY.formatted}<span className="text-base font-normal ml-1">/mês</span></p>
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
                <Zap className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Economize até 10 horas por semana</span>
              </li>
              <li className="flex items-center">
                <BookOpen className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Biblioteca ampliada (+5000 alimentos)</span>
              </li>
              <li className="flex items-center">
                <FileText className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Exportação de relatórios premium</span>
              </li>
            </ul>
            
            <div className="mt-auto">
              <a 
                onClick={() => importHotmart()}
                href="https://pay.hotmart.com/C99693448A?checkoutMode=2&off=ebyhyh4d" 
                className="hotmart-fb hotmart__button-checkout w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium py-3 px-6 bg-nutri-blue text-white hover:bg-white hover:text-nutri-blue border border-nutri-blue transition-all duration-300 hover:shadow-md active:scale-[0.98] relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer after:bg-[length:200%_100%] after:opacity-0 hover:after:opacity-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                Assinar Pro Mensal
              </a>
            </div>
          </motion.div>
          
          {/* Plano Anual */}
          <motion.div 
            className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl p-8 border-2 border-nutri-blue relative w-full md:w-[calc(33%-1rem)] flex flex-col"
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
              <p className="text-nutri-blue text-2xl font-bold mt-4">{SUBSCRIPTION_PRICES.ANNUAL.formatted}<span className="text-base font-normal ml-1">/ano</span></p>
              <p className="text-sm text-gray-500 mt-1">(equivale a {SUBSCRIPTION_PRICES.ANNUAL.monthlyEquivalent}/mês)</p>
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
                <Zap className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Economize até 10 horas por semana</span>
              </li>
              <li className="flex items-center">
                <BookOpen className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Biblioteca ampliada (+5000 alimentos)</span>
              </li>
              <li className="flex items-center">
                <FileText className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Exportação de relatórios premium</span>
              </li>
              <li className="flex items-center">
                <Badge className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Selo de nutricionista premium</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 text-nutri-green mr-2" />
                <span className="text-gray-600">Acesso antecipado a novas funcionalidades</span>
              </li>
            </ul>
            
            <div className="mt-auto">
              <a 
                onClick={() => importHotmart()}
                href="https://pay.hotmart.com/C99693448A?checkoutMode=2&off=1z0js5wf" 
                className="hotmart-fb hotmart__button-checkout w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium py-3 px-6 bg-gradient-to-r from-nutri-green-light to-nutri-green-dark text-white border border-green-400 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0 active:shadow-md active:scale-[0.98] relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer after:bg-[length:200%_100%] after:opacity-0 hover:after:opacity-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex flex-col items-center">
                  Assinar Pro Anual 
                  <span className="text-xs opacity-90 mt-0.5">(recomendado)</span>
                </span>
              </a>
            </div>
          </motion.div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">Acesso imediato após a confirmação do pagamento</p>
          <p className="mt-2 text-gray-500 text-sm flex items-center justify-center">
            <Award className="h-4 w-4 mr-2 text-nutri-green" />
            7 dias de garantia de devolução do dinheiro
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
