
import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Check, Zap, BookOpen, FileText, Badge, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUBSCRIPTION_PRICES } from '@/constants/subscriptionConstants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PricingHeader from '@/components/pricing/PricingHeader';
import PricingPlan from '@/components/pricing/PricingPlan';
import PricingFooter from '@/components/pricing/PricingFooter';
import HotmartButton from '@/components/pricing/HotmartButton';

const Pricing = () => {
  return (
    <Layout>
      <Helmet>
        <title>Planos e Preços - NutriFlow Pro</title>
      </Helmet>
      
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <PricingHeader 
          title="Planos para cada necessidade"
          subtitle="Escolha o plano ideal para impulsionar sua prática como nutricionista"
        />
        
        <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0 max-w-6xl mx-auto">
          {/* Plano Free */}
          <Card className="border-gray-200 hover:shadow-md transition-shadow flex flex-col">
            <PricingPlan
              title="Plano Free"
              price="Gratuito"
              description="Acesso básico às funcionalidades"
              features={[
                { icon: Check, text: "Até 10 pacientes" },
                { icon: Check, text: "Calculadora nutricional básica" },
                { icon: Check, text: "Histórico básico de consultas" }
              ]}
              ctaButton={
                <Button
                  className="w-full"
                  variant="nutri-outline"
                  animation="shimmer"
                  asChild
                >
                  <Link to="/signup">
                    Comece Agora
                  </Link>
                </Button>
              }
            />
          </Card>
          
          {/* Plano Mensal */}
          <Card className="border-gray-200 hover:shadow-md transition-shadow flex flex-col">
            <PricingPlan
              title="Plano Mensal"
              price={SUBSCRIPTION_PRICES.MONTHLY.formatted}
              priceDetail="/mês"
              description="Acesso a todas as funcionalidades"
              features={[
                { icon: Check, text: "Pacientes ilimitados" },
                { icon: Check, text: "Gerador de planos alimentares" },
                { icon: Zap, text: "Economize até 10 horas por semana" },
                { icon: BookOpen, text: "Biblioteca ampliada (+5000 alimentos)" }
              ]}
              ctaButton={
                <HotmartButton
                  url="https://pay.hotmart.com/C99693448A?checkoutMode=2&off=ebyhyh4d"
                >
                  Assinar Pro Mensal
                </HotmartButton>
              }
            />
          </Card>
          
          {/* Plano Anual */}
          <Card className="border-nutri-blue border-2 relative hover:shadow-lg transition-shadow flex flex-col">
            <PricingPlan
              title="Plano Anual"
              price={SUBSCRIPTION_PRICES.ANNUAL.formatted}
              priceDetail="/ano"
              description={`(equivale a ${SUBSCRIPTION_PRICES.ANNUAL.monthlyEquivalent}/mês)`}
              badge="ECONOMIA DE 20%"
              highlighted={true}
              features={[
                { icon: Check, text: "Tudo do plano mensal" },
                { icon: FileText, text: "Exportação de relatórios premium" },
                { icon: Badge, text: "Selo de nutricionista premium" },
                { icon: Clock, text: "Acesso antecipado a novas funcionalidades" },
                { icon: Check, text: "Economia de 20% em relação ao plano mensal" }
              ]}
              ctaButton={
                <HotmartButton
                  url="https://pay.hotmart.com/C99693448A?checkoutMode=2&off=1z0js5wf"
                  variant="gradient"
                >
                  <span className="flex flex-col items-center">
                    Assinar Pro Anual 
                    <span className="text-xs opacity-90 mt-0.5">(recomendado)</span>
                  </span>
                </HotmartButton>
              }
            />
          </Card>
        </div>
        
        <PricingFooter />
      </div>
    </Layout>
  );
};

export default Pricing;
