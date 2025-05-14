
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  description: string;
  value: string | number;
  infoText?: string;
  valueColor: string;
  subtitle?: string;
  subtitleColor?: string;
}

const MetricCard = ({
  title,
  description,
  value,
  infoText,
  valueColor,
  subtitle,
  subtitleColor
}: MetricCardProps) => {
  return (
    <Card className="bg-nutri-gray-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {title}
          {infoText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 ml-1 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{infoText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
        {subtitle && (
          <p className={`text-sm ${subtitleColor || 'text-gray-600'} mt-2`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
