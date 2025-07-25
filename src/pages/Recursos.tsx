
import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Recursos = () => {
  const navigate = useNavigate();
  
  const featuresBasic = [
    "Calculadora nutricional básica",
    "Controle de 10 pacientes",
    "Criação de planos alimentares simples",
    "Histórico básico de consultas"
  ];
  
  const featuresPremium = [
    "Calculadora nutricional avançada",
    "Controle ilimitado de pacientes",
    "IA para criação de planos alimentares",
    "Histórico completo de consultas",
    "Exportação de relatórios em PDF",
    "Suporte premium 24/7",
    "Integração com apps de pacientes",
    "Análises e gráficos avançados"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          Recursos do <span className="text-nutri-green">Nutri</span><span className="text-nutri-blue">Flow Pro</span>
        </h1>
        
        <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-gray-700">
          Conheça todos os recursos disponíveis para otimizar seu trabalho como nutricionista e entregar resultados excepcionais para seus pacientes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Plano Básico */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Plano Básico</h2>
              <p className="text-nutri-blue text-lg font-medium">Gratuito</p>
              <p className="text-gray-700 mt-2">Ideal para começar</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {featuresBasic.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-nutri-green mr-2" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-nutri-blue text-white hover:bg-nutri-blue-dark transition-colors"
              onClick={() => navigate('/signup')}
            >
              Começar Gratuitamente
            </Button>
          </div>
          
          {/* Plano Premium */}
          <div className="bg-gradient-to-br from-nutri-blue to-nutri-blue-dark rounded-xl shadow-lg p-8 border border-blue-400 transform hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <div className="flex justify-center items-center mb-2">
                <Star className="h-6 w-6 text-yellow-300 fill-current" />
                <h2 className="text-2xl font-bold text-white ml-2">Plano Premium</h2>
              </div>
              <p className="text-white text-lg font-medium">R$ 97,00 <span className="text-sm font-normal">/mês</span></p>
              <p className="text-blue-100 mt-2">Recursos completos</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {featuresPremium.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-yellow-300 mr-2" />
                  <span className="text-white">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-white text-nutri-blue hover:bg-nutri-gray-light transition-colors"
              onClick={() => navigate('/signup?plan=premium')}
            >
              Assinar Premium
            </Button>
            
            <p className="text-center text-blue-100 text-sm mt-4">
              7 dias de garantia de devolução do dinheiro
            </p>
          </div>
        </div>
        
        {/* Seção de recursos destaque */}
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-900">
            Recursos em destaque
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 mb-4 overflow-hidden rounded-lg">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1594882645126-14020914d58d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Calculadora nutricional"
                  className="w-full h-full object-cover"
                  fallbackSrc="/placeholder.svg"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Calculadora Nutricional</h3>
              <p className="text-gray-700">Calcule com precisão as necessidades nutricionais de seus pacientes com nossa calculadora avançada.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 mb-4 overflow-hidden rounded-lg">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Planos alimentares"
                  className="w-full h-full object-cover"
                  fallbackSrc="/placeholder.svg"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Planos Alimentares</h3>
              <p className="text-gray-700">Crie planos alimentares personalizados com sugestões de alimentos e receitas baseadas em IA.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 mb-4 overflow-hidden rounded-lg">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Gestão de pacientes"
                  className="w-full h-full object-cover"
                  fallbackSrc="/placeholder.svg"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Gestão de Pacientes</h3>
              <p className="text-gray-700">Acompanhe a evolução de seus pacientes com gráficos e relatórios detalhados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recursos;
