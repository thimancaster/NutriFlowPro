
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PricingFeatureItemProps {
  icon: LucideIcon;
  text: string;
}

const PricingFeatureItem: React.FC<PricingFeatureItemProps> = ({ icon: Icon, text }) => {
  return (
    <li className="flex items-center space-x-3">
      <Icon className="h-5 w-5 text-nutri-green flex-shrink-0 mr-2" />
      <span className="text-gray-600">{text}</span>
    </li>
  );
};

export default PricingFeatureItem;
