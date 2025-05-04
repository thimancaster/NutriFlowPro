
import React from 'react';
import CalculatorTool from '@/components/CalculatorTool';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, Calculator as CalculatorIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Calculator = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center mb-4 text-sm text-gray-600">
          <Link to="/" className="flex items-center hover:text-nutri-blue transition-colors">
            <Home className="h-4 w-4 mr-1" />
            <span>Início</span>
          </Link>
          <ChevronRight className="h-3 w-3 mx-2" />
          <span className="font-medium text-nutri-blue flex items-center">
            <CalculatorIcon className="h-4 w-4 mr-1" />
            Calculadora
          </span>
        </div>
        
        <motion.div 
          className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mb-3 text-nutri-blue">Calculadora Nutricional</h1>
            <p className="text-gray-600 mb-4">Use nossa calculadora avançada para determinar as necessidades calóricas e nutricionais de seus pacientes com precisão.</p>
            <div className="bg-white p-5 rounded-xl shadow-lg">
              <CalculatorTool />
            </div>
          </div>
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt="Nutrição e cálculos" 
              className="w-full h-80 object-cover"
            />
            <div className="bg-white p-5">
              <h2 className="text-xl font-semibold mb-2">Por que calcular?</h2>
              <p className="text-gray-600">Cálculos precisos de macronutrientes e calorias são essenciais para desenvolver planos nutricionais personalizados e eficazes para seus pacientes.</p>
              
              <div className="mt-4 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-700">
                <p className="font-medium">Novidade: Cadastro rápido de pacientes</p>
                <p>Para maior agilidade, agora você pode inserir o nome do paciente diretamente na calculadora e realizar o cadastro completo depois de ter os resultados.</p>
              </div>
              
              <div className="mt-4">
                <Link to="/meal-plans">
                  <Button variant="outline" className="text-nutri-blue">
                    Ver Planos Alimentares
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calculator;
