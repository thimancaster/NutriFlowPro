
import React from 'react';
import FreePlanCard from './plan-cards/FreePlanCard';
import MonthlyPlanCard from './plan-cards/MonthlyPlanCard';
import AnnualPlanCard from './plan-cards/AnnualPlanCard';

interface PricingPlansProps {
  isPremium: boolean;
  subscription: any;
  getPatientsQuota: Function;
  getMealPlansQuota: Function;
}

/**
 * Component for displaying pricing plans
 */
const PricingPlans: React.FC<PricingPlansProps> = ({ 
  isPremium,
  subscription,
  getPatientsQuota,
  getMealPlansQuota
}) => {
  const patientsQuota = getPatientsQuota();
  const mealPlansQuota = getMealPlansQuota();
  
  // Free tier features for display
  const freeTierFeatures = [
    { name: "Pacientes cadastrados", value: `Limitado (${patientsQuota.limit})`, available: true },
    { name: "Planos Alimentares", value: `Limitado (${mealPlansQuota.limit}/mês)`, available: true },
    { name: "Acesso a ferramentas básicas de cálculo", value: "Sim", available: true },
    { name: "Histórico básico de medidas", value: "30 dias", available: true },
    { name: "Suporte ao cliente", value: "Email", available: true },
    { name: "Planos alimentares avançados", value: "Não", available: false },
    { name: "Exportação de relatórios", value: "Não", available: false },
  ];
  
  // Premium features for display
  const premiumFeatures = [
    { name: "Pacientes cadastrados", value: "Ilimitado", available: true },
    { name: "Planos Alimentares", value: "Ilimitado", available: true },
    { name: "Acesso a todas as ferramentas de cálculo", value: "Sim", available: true },
    { name: "Histórico completo de medidas", value: "Completo", available: true },
    { name: "Economize até 10 horas por semana", value: "Sim", available: true },
    { name: "Biblioteca ampliada (+5000 alimentos)", value: "Sim", available: true },
    { name: "Planos alimentares avançados", value: "Sim", available: true },
    { name: "Exportação de relatórios premium", value: "Sim", available: true },
    { name: "Selo de nutricionista premium", value: "Sim", available: true },
    { name: "Acesso antecipado a novas funcionalidades", value: "Sim", available: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <FreePlanCard 
        isPremium={isPremium} 
        features={freeTierFeatures} 
      />
      
      <MonthlyPlanCard 
        isPremium={isPremium} 
        features={premiumFeatures}
        subscription={subscription}
      />
      
      <AnnualPlanCard 
        features={premiumFeatures} 
      />
    </div>
  );
};

export default PricingPlans;
