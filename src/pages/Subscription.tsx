
import React from 'react';
import { Button } from "@/components/ui/button";
import { Star, Check, ArrowRight } from 'lucide-react';
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const { data: subscription } = useUserSubscription();
  const navigate = useNavigate();

  const features = [
    { name: "Pacientes cadastrados", free: "Limitado (5)", premium: "Ilimitado" },
    { name: "Geração de Planos Alimentares", free: "Limitado (3/mês)", premium: "Ilimitado" },
    { name: "Acesso a todas as ferramentas de cálculo", free: "Sim", premium: "Sim" },
    { name: "Histórico de medidas antropométricas", free: "30 dias", premium: "Completo" },
    { name: "Suporte prioritário", free: "Não", premium: "Sim" },
    { name: "Treinamentos exclusivos", free: "Não", premium: "Sim" },
    { name: "Personalização do perfil", free: "Básica", premium: "Avançada" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">
          <span className="text-nutri-green">Planos</span> 
          <span className="text-nutri-blue"> NutriFlow Pro</span>
        </h1>
        
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          Escolha o plano que melhor se adapta às suas necessidades e impulsione sua prática como nutricionista.
        </p>

        {/* Comparison Table - Desktop */}
        <div className="hidden md:block max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-nutri-blue-light text-white">
                <tr>
                  <th className="py-4 px-6 text-left">Recursos</th>
                  <th className="py-4 px-6 text-center">Plano Gratuito</th>
                  <th className="py-4 px-6 text-center bg-nutri-blue">Plano Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-6 font-medium">{feature.name}</td>
                    <td className="py-3 px-6 text-center">{feature.free}</td>
                    <td className="py-3 px-6 text-center bg-blue-50">{feature.premium}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 font-medium">Preço</td>
                  <td className="py-4 px-6 text-center font-medium">R$ 0</td>
                  <td className="py-4 px-6 text-center bg-blue-50">
                    <div className="font-bold text-nutri-blue">R$ 97,00<span className="text-sm font-normal text-gray-500">/mês</span></div>
                    <div className="text-sm text-gray-600">ou R$ 970,00/ano (2 meses grátis)</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Mensal */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Plano Mensal</h2>
              <p className="text-3xl font-bold text-nutri-blue">R$ 97,00<span className="text-lg font-normal text-gray-500">/mês</span></p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-600">
                <Check className="h-5 w-5 text-nutri-green mr-2" />
                Acesso a todas as funcionalidades
              </li>
              <li className="flex items-center text-gray-600">
                <Check className="h-5 w-5 text-nutri-green mr-2" />
                Suporte prioritário
              </li>
              <li className="flex items-center text-gray-600">
                <Check className="h-5 w-5 text-nutri-green mr-2" />
                Pacientes ilimitados
              </li>
            </ul>
            
            <Button 
              className={`w-full ${subscription?.isPremium 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gradient-to-r from-nutri-blue to-nutri-blue-dark hover:opacity-90'}`}
              onClick={() => window.location.href = 'https://pay.kiwify.com.br/nv9DKL8'}
              disabled={subscription?.isPremium}
            >
              {subscription?.isPremium ? 'Você já é Premium' : 'Assinar Plano Mensal'}
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
                <Check className="h-5 w-5 text-yellow-300 mr-2" />
                Todas as funcionalidades do plano mensal
              </li>
              <li className="flex items-center text-white">
                <Check className="h-5 w-5 text-yellow-300 mr-2" />
                2 meses grátis
              </li>
              <li className="flex items-center text-white">
                <Check className="h-5 w-5 text-yellow-300 mr-2" />
                Treinamentos exclusivos
              </li>
            </ul>
            
            <Button 
              className="w-full bg-white text-nutri-blue hover:bg-blue-50 transition-colors"
              onClick={() => window.location.href = 'https://pay.kiwify.com.br/usRxcG3'}
              disabled={subscription?.isPremium}
            >
              {subscription?.isPremium ? 'Você já é Premium' : 'Assinar Plano Anual'}
            </Button>
            
            <p className="text-center text-blue-100 text-sm mt-4">
              7 dias de garantia de devolução do dinheiro
            </p>
          </div>
        </div>

        {subscription?.isPremium && (
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="mx-auto"
            >
              Voltar para o Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
