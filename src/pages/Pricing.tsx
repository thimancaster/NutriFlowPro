
import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();
  
  const handleSubscribe = (plan: string) => {
    navigate('/subscription', { state: { selectedPlan: plan } });
  };
  
  return (
    <Layout>
      <Helmet>
        <title>Planos e Preços - NutriFlow Pro</title>
      </Helmet>
      
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h1 className="mb-4 text-4xl tracking-tight font-extrabold text-nutri-blue">
            Planos para cada necessidade
          </h1>
          <p className="mb-5 font-light text-gray-500 sm:text-xl">
            Escolha o plano ideal para impulsionar sua prática como nutricionista
          </p>
        </div>
        
        <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
          {/* Plano Gratuito */}
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gray-50 rounded-t-lg border-b p-6">
              <CardTitle className="text-xl font-medium">Básico</CardTitle>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-semibold text-gray-900">GRÁTIS</span>
              </div>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Para profissionais iniciantes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Até 10 pacientes</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Consultas básicas</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Calculadora nutricional</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Histórico básico de pacientes</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg p-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubscribe('free')}
              >
                Continuar Grátis
              </Button>
            </CardFooter>
          </Card>
          
          {/* Plano Premium */}
          <Card className="border-nutri-blue relative hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 bg-nutri-blue text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
              MAIS POPULAR
            </div>
            <CardHeader className="bg-blue-50 rounded-t-lg border-b p-6">
              <CardTitle className="text-xl font-medium">Premium</CardTitle>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-semibold text-gray-900">R$49,90</span>
                <span className="text-gray-500 text-sm ml-1">/mês</span>
              </div>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Para a maioria dos profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Pacientes ilimitados</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Gerador de planos alimentares</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Exportação de relatórios</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Histórico completo e antropometria</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Compartilhamento via WhatsApp</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-blue-50 rounded-b-lg p-6">
              <Button
                className="w-full bg-nutri-blue hover:bg-blue-700"
                onClick={() => handleSubscribe('premium')}
              >
                Assinar Agora
              </Button>
            </CardFooter>
          </Card>
          
          {/* Plano Empresarial */}
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gray-50 rounded-t-lg border-b p-6">
              <CardTitle className="text-xl font-medium">Empresarial</CardTitle>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-semibold text-gray-900">R$149,90</span>
                <span className="text-gray-500 text-sm ml-1">/mês</span>
              </div>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Para clínicas e equipes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Tudo do plano Premium</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Até 5 profissionais</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Painel administrativo</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Relatórios avançados</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Suporte prioritário</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg p-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubscribe('enterprise')}
              >
                Contato Empresarial
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
