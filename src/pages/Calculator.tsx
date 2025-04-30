
import React from 'react';
import CalculatorTool from '@/components/CalculatorTool';
import { motion } from 'framer-motion';

const Calculator = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calculator;
