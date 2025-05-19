
import React, { ReactNode } from 'react';
import PricingFeatureItem from './PricingFeatureItem';
import { LucideIcon } from 'lucide-react';

export interface PricingFeature {
  icon: LucideIcon;
  text: string;
}

interface PricingPlanProps {
  title: string;
  price: string;
  priceDetail?: string;
  description?: string;
  features: PricingFeature[];
  badge?: string;
  highlighted?: boolean;
  ctaButton: ReactNode;
  className?: string;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  title,
  price,
  priceDetail,
  description,
  features,
  badge,
  highlighted = false,
  ctaButton,
  className = ""
}) => {
  return (
    <div 
      className={`
        ${highlighted ? 
          'border-2 border-nutri-blue bg-gradient-to-br from-white to-blue-50 shadow-xl' : 
          'border border-gray-200 bg-white shadow-md'
        }
        rounded-xl p-6 md:p-8 w-full flex flex-col relative ${className}
      `}
    >
      {badge && (
        <div className={`absolute -top-4 right-4 bg-nutri-green text-white text-xs px-3 py-1 rounded-full font-medium`}>
          {badge}
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-nutri-blue text-2xl font-bold mt-4">
          {price}
          {priceDetail && <span className="text-base font-normal ml-1">{priceDetail}</span>}
        </p>
        {description && <p className="text-gray-500 mt-2">{description}</p>}
      </div>
      
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <PricingFeatureItem 
            key={index}
            icon={feature.icon}
            text={feature.text}
          />
        ))}
      </ul>
      
      <div className="mt-auto">
        {ctaButton}
      </div>
    </div>
  );
};

export default PricingPlan;
