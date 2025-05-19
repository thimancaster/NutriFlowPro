
import React from 'react';
import { Award } from 'lucide-react';

interface PricingFooterProps {
  className?: string;
}

const PricingFooter: React.FC<PricingFooterProps> = ({ className = "" }) => {
  return (
    <div className={`text-center mt-10 ${className}`}>
      <p className="text-gray-500 text-sm">Acesso imediato após a confirmação do pagamento</p>
      <p className="mt-2 text-gray-500 text-sm flex items-center justify-center">
        <Award className="h-4 w-4 mr-2 text-nutri-green" />
        7 dias de garantia de devolução do dinheiro
      </p>
    </div>
  );
};

export default PricingFooter;
