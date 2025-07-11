
import React from 'react';

interface PricingHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PricingHeader: React.FC<PricingHeaderProps> = ({ title, subtitle, className = "" }) => {
  return (
    <div className={`text-center mb-8 lg:mb-12 ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{title}</h2>
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PricingHeader;
