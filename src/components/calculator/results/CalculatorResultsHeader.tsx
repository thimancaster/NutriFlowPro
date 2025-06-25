
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import CacheIndicator from '@/components/ui/CacheIndicator';

interface CalculatorResultsHeaderProps {
  fromCache?: boolean;
  cacheAge?: number;
}

const CalculatorResultsHeader: React.FC<CalculatorResultsHeaderProps> = ({
  fromCache = false,
  cacheAge
}) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-xl flex items-center">
          <span>Resultados do Cálculo</span>
          <Info className="h-5 w-5 ml-2 text-nutri-blue opacity-70" />
        </CardTitle>
        <CacheIndicator fromCache={fromCache} cacheAge={cacheAge} />
      </div>
    </CardHeader>
  );
};

export default CalculatorResultsHeader;
