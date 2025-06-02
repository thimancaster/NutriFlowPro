
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  description: string;
  value: string | number;
  infoText: string;
  valueColor?: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  description,
  value,
  infoText,
  valueColor = "text-nutri-blue",
  subtitle
}) => {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-1">
          {title}
          <div className="relative group">
            <Info className="h-4 w-4 text-gray-500 cursor-help" />
            <div className="absolute left-0 top-6 hidden group-hover:block z-50 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap max-w-xs">
              {infoText}
            </div>
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-xl font-semibold ${valueColor}`}>{value}</div>
        {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
