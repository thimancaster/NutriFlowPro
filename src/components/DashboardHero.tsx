
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator } from 'lucide-react';

interface DashboardHeroProps {}

const DashboardHero: React.FC<DashboardHeroProps> = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gradient-to-r from-nutri-blue-light to-nutri-blue rounded-2xl p-8 text-white shadow-xl relative overflow-hidden transform transition-all duration-300 hover:shadow-2xl dark:shadow-dark-xl dark:hover:shadow-dark-2xl">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 blur-xl"></div>
      </div>
      
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in">Bem-vindo ao NutriFlow Pro</h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          O sistema completo para nutricionistas que desejam otimizar seus processos e entregar resultados excepcionais para seus pacientes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            className="bg-white text-nutri-blue border-white hover:bg-nutri-blue-light hover:text-white hover:border-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            onClick={() => navigate('/calculator')}
            animation="shimmer"
          >
            <Calculator className="h-4 w-4" />
            Iniciar Agora
          </Button>
          <Button 
            variant="outline"
            className="bg-white text-nutri-blue border-white hover:bg-nutri-blue-light hover:text-white hover:border-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            onClick={() => navigate('/recursos')}
            animation="shimmer"
          >
            <ArrowRight className="h-4 w-4" />
            Conhecer Recursos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
