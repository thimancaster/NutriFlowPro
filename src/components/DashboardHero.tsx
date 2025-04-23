
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardHeroProps {}

const DashboardHero: React.FC<DashboardHeroProps> = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gradient-to-r from-nutri-blue-light to-nutri-blue rounded-2xl p-8 text-white shadow-xl">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">Bem-vindo ao NutriFlow Pro</h2>
      <p className="text-lg opacity-90 mb-6 max-w-2xl">
        O sistema completo para nutricionistas que desejam otimizar seus processos e entregar resultados excepcionais para seus pacientes.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          className="text-white border-white hover:bg-white hover:text-nutri-blue transition-colors duration-200"
          onClick={() => navigate('/calculator')}>
          Iniciar Agora
        </Button>
        <Button 
          variant="outline"
          className="text-white border-white hover:bg-white hover:text-nutri-blue transition-colors duration-200"
          onClick={() => navigate('/patients')}>
          Conhecer Recursos
        </Button>
      </div>
    </div>
  );
};

export default DashboardHero;
