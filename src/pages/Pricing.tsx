
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Pricing = () => {
  useEffect(() => {
    // Add Hotmart checkout script
    const script = document.createElement('script');
    script.src = 'https://static.hotmart.com/checkout/widget.min.js';
    script.async = true;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
    
    document.head.appendChild(script);
    document.head.appendChild(link);
    
    return () => {
      // Cleanup on unmount
      if (document.head.contains(script)) document.head.removeChild(script);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);
  
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
        
        <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0 max-w-6xl mx-auto">
          {/* Plano Free */}
          <Card className="border-gray-200 hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="bg-gray-50 rounded-t-lg border-b p-6">
              <CardTitle className="text-xl font-medium">Plano Free</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-semibold text-gray-900">Gratuito</span>
              </div>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Acesso básico às funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <ul className="space-y-4">
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Até 10 pacientes</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Calculadora nutricional básica</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Histórico básico de consultas</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg p-6">
              <Link
                to="/signup"
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium inline-flex justify-center items-center hover:bg-gray-600 transition-colors"
              >
                Comece Agora
              </Link>
            </CardFooter>
          </Card>
          
          {/* Plano Mensal */}
          <Card className="border-gray-200 hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="bg-gray-50 rounded-t-lg border-b p-6">
              <CardTitle className="text-xl font-medium">Plano Mensal</CardTitle>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-semibold text-gray-900">R$ 57,90</span>
                <span className="text-gray-500 text-sm ml-1">/mês</span>
              </div>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Acesso a todas as funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
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
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg p-6">
              <a 
                href="https://pay.hotmart.com/COD_MONTHLY?checkoutMode=2" 
                className="w-full bg-nutri-blue text-white py-3 px-6 rounded-lg font-medium inline-flex justify-center items-center hover:bg-blue-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Assinar Mensal
              </a>
            </CardFooter>
          </Card>
          
          {/* Plano Anual */}
          <Card className="border-nutri-blue border-2 relative hover:shadow-lg transition-shadow flex flex-col">
            <div className="absolute top-0 right-0 bg-nutri-green text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
              ECONOMIA DE 20%
            </div>
            <CardHeader className="bg-blue-50 rounded-t-lg border-b p-6">
              <CardTitle className="text-xl font-medium">Plano Anual</CardTitle>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-semibold text-gray-900">R$ 557,00</span>
                <span className="text-gray-500 text-sm ml-1">/ano</span>
              </div>
              <CardDescription className="text-sm text-gray-500 mt-1">
                (equivale a R$ 46,42/mês)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <ul className="space-y-4">
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Tudo do plano mensal</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Pacientes ilimitados</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Gerador avançado de planos alimentares</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Suporte prioritário</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-gray-700">Economia de 20% em relação ao plano mensal</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-blue-50 rounded-b-lg p-6">
              <a 
                href="https://pay.hotmart.com/C99693448A?checkoutMode=2" 
                className="w-full bg-nutri-green text-white py-3 px-6 rounded-lg font-medium inline-flex justify-center items-center hover:bg-green-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Assinar Anual (Recomendado)
              </a>
            </CardFooter>
          </Card>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-gray-500">7 dias de garantia de devolução do dinheiro</p>
          <p className="text-gray-500 mt-2">Acesso imediato após a confirmação do pagamento</p>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
