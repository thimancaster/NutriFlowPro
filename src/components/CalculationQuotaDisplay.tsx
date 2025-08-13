
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Calculator, AlertTriangle } from 'lucide-react';
import { useCalculationQuota } from '@/hooks/useCalculationQuota';

interface CalculationQuotaDisplayProps {
  className?: string;
  showUpgradeButton?: boolean;
}

const CalculationQuotaDisplay: React.FC<CalculationQuotaDisplayProps> = ({ 
  className = "",
  showUpgradeButton = true 
}) => {
  const { quotaStatus, isLoading, isPremium, attemptsRemaining } = useCalculationQuota();

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Calculator className="h-4 w-4 animate-pulse" />
            <span className="text-sm text-muted-foreground">Carregando status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quotaStatus) return null;

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {isPremium ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Plano Premium</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Cálculos Ilimitados
              </Badge>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Plano Gratuito</span>
                </div>
                <Badge 
                  variant={quotaStatus.quota_exceeded ? "destructive" : "secondary"}
                  className={quotaStatus.quota_exceeded ? "" : "bg-green-100 text-green-800"}
                >
                  {attemptsRemaining} de 10 restantes
                </Badge>
              </div>
              
              {quotaStatus.quota_exceeded && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    Limite de cálculos gratuitos atingido
                  </span>
                </div>
              )}

              {showUpgradeButton && (
                <Button 
                  size="sm" 
                  className="w-full"
                  variant={quotaStatus.quota_exceeded ? "default" : "outline"}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer Upgrade para Premium
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculationQuotaDisplay;
