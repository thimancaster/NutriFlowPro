
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator } from 'lucide-react';

interface DashboardHeroProps {}

const DashboardHero: React.FC<DashboardHeroProps> = () => {
  const navigate = useNavigate();
  
  return (
    <div className="gradient-bright-hover rounded-2xl p-8 text-white shadow-xl relative overflow-hidden transform transition-all duration-300 hover:shadow-2xl glass-card bg-gradient-to-br from-primary to-nutri-blue dark:from-card dark:to-background/80">
      {/* Background decorative elements harmonizados para ambos os temas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 dark:bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 dark:bg-accent/5 rounded-full translate-x-1/2 translate-y-1/2 blur-xl float-animation"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/20 dark:bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
      </div>
      
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in text-white dark:text-foreground">
          Bem-vindo ao NutriFlow Pro
        </h2>
        <p className="text-lg opacity-90 dark:opacity-80 mb-6 max-w-2xl mx-auto transition-all duration-300 hover:opacity-100 text-white/90 dark:text-muted-foreground dark:hover:text-foreground">
          O sistema completo para nutricionistas que desejam otimizar seus processos e entregar resultados excepcionais para seus pacientes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-primary dark:bg-background/20 dark:text-foreground dark:border-border dark:hover:bg-accent dark:hover:text-accent-foreground hover:border-white dark:hover:border-primary transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
            onClick={() => navigate('/calculator')}
          >
            <Calculator className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            Iniciar Agora
          </Button>
          <Button 
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-primary dark:bg-background/20 dark:text-foreground dark:border-border dark:hover:bg-accent dark:hover:text-accent-foreground hover:border-white dark:hover:border-primary transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
            onClick={() => navigate('/recursos')}
          >
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            Conhecer Recursos
          </Button>
        </div>
      </div>
      
      {/* Glass overlay effect harmonizado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 dark:via-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default DashboardHero;
