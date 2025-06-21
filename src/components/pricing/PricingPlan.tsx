
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FeatureItem {
  icon: LucideIcon;
  text: string;
}

interface PricingPlanProps {
  title: string;
  price: string;
  priceDetail?: string;
  description?: string;
  badge?: string;
  highlighted?: boolean;
  features: FeatureItem[];
  ctaButton: React.ReactNode;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  title,
  price,
  priceDetail,
  description,
  badge,
  highlighted = false,
  features,
  ctaButton
}) => {
  return (
    <Card className={`relative glass-card smooth-lift ${highlighted ? 'border-nutri-blue border-2 gradient-bright-hover shadow-lg' : 'border-gray-300 dark:border-slate-600'} flex flex-col h-full transition-all duration-300 hover:shadow-xl magnetic-hover bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-nutri-green text-white px-4 py-1 font-bold animate-pulse-soft shadow-lg border border-white/20">
            {badge}
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-slate-100 text-glow-hover">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-nutri-green dark:text-dark-accent-green">{price}</span>
          {priceDetail && <span className="text-gray-700 dark:text-slate-300 font-medium">{priceDetail}</span>}
        </div>
        {description && (
          <CardDescription className="text-sm text-gray-700 dark:text-slate-300 mt-2 font-medium">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
              <feature.icon className="h-5 w-5 text-nutri-green dark:text-dark-accent-green mt-0.5 flex-shrink-0 font-bold" />
              <span className="text-sm text-gray-800 dark:text-slate-200 font-medium leading-relaxed">{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-6">
        {ctaButton}
      </CardFooter>
    </Card>
  );
};

export default PricingPlan;
