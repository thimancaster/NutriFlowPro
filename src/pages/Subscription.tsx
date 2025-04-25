
import React from 'react';
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';

const Subscription = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="text-nutri-green">Planos</span> 
          <span className="text-nutri-blue"> NutriFlow Pro</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Mensal */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Plano Mensal</h2>
              <p className="text-3xl font-bold text-nutri-blue">R$ 97,00<span className="text-lg font-normal text-gray-500">/mês</span></p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-600">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                Acesso a todas as funcionalidades
              </li>
              <li className="flex items-center text-gray-600">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                Suporte prioritário
              </li>
              <li className="flex items-center text-gray-600">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                Pacientes ilimitados
              </li>
            </ul>
            
            <Button 
              className="w-full bg-gradient-to-r from-nutri-blue to-nutri-blue-dark hover:opacity-90"
              onClick={() => window.location.href = 'https://pay.kiwify.com.br/nv9DKL8'}
            >
              Assinar Plano Mensal
            </Button>
          </div>
          
          {/* Plano Anual */}
          <div className="bg-gradient-to-br from-nutri-blue to-nutri-blue-dark rounded-xl shadow-lg p-8 border border-blue-400 transform hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <div className="flex justify-center items-center mb-2">
                <Star className="h-6 w-6 text-yellow-300 fill-current" />
                <h2 className="text-2xl font-bold text-white ml-2">Plano Anual</h2>
              </div>
              <p className="text-3xl font-bold text-white">R$ 970,00<span className="text-lg font-normal text-blue-100">/ano</span></p>
              <p className="text-blue-100 mt-2">Economia de 2 meses!</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-white">
                <Star className="h-5 w-5 text-yellow-300 mr-2" />
                Todas as funcionalidades do plano mensal
              </li>
              <li className="flex items-center text-white">
                <Star className="h-5 w-5 text-yellow-300 mr-2" />
                2 meses grátis
              </li>
              <li className="flex items-center text-white">
                <Star className="h-5 w-5 text-yellow-300 mr-2" />
                Treinamentos exclusivos
              </li>
            </ul>
            
            <Button 
              className="w-full bg-white text-nutri-blue hover:bg-blue-50 transition-colors"
              onClick={() => window.location.href = 'https://pay.kiwify.com.br/usRxcG3'}
            >
              Assinar Plano Anual
            </Button>
            
            <p className="text-center text-blue-100 text-sm mt-4">
              7 dias de garantia de devolução do dinheiro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
