
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
    <Card className={`relative transition-all duration-300 hover:shadow-lg ${highlighted ? 'border-primary shadow-md' : 'border-border'} flex flex-col h-full bg-card`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 font-medium">
            {badge}
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-primary">{price}</span>
          {priceDetail && <span className="text-muted-foreground font-medium">{priceDetail}</span>}
        </div>
        {description && (
          <CardDescription className="text-sm text-muted-foreground mt-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <feature.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground leading-relaxed">{feature.text}</span>
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
