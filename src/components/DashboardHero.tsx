
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator } from 'lucide-react';

interface DashboardHeroProps {}

const DashboardHero: React.FC<DashboardHeroProps> = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative rounded-2xl p-8 shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-primary/10 to-accent/10 dark:from-card dark:to-background/80 border border-border backdrop-blur-sm">
      {/* Background decorative elements harmonizados para ambos os temas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full translate-x-1/2 translate-y-1/2 blur-xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-primary/10 dark:bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
      </div>
      
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in text-foreground">
          Bem-vindo ao NutriFlow Pro
        </h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto transition-all duration-300 hover:opacity-90 text-muted-foreground">
          O sistema completo para nutricionistas que desejam otimizar seus processos e entregar resultados excepcionais para seus pacientes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="primary" 
            className="transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
            onClick={() => navigate('/calculator')}
          >
            <Calculator className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            Iniciar Agora
          </Button>
          <Button 
            variant="outline"
            className="transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
            onClick={() => navigate('/recursos')}
          >
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            Conhecer Recursos
          </Button>
        </div>
      </div>
      
      {/* Glass overlay effect harmonizado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/2 dark:via-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default DashboardHero;
