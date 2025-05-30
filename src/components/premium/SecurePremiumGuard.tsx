
import React, { useEffect, useState } from 'react';
import { usePremiumSecurity } from '@/hooks/premium/usePremiumSecurity';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Lock, Crown, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SecurePremiumGuardProps {
  children: React.ReactNode;
  feature: 'patients' | 'meal_plans' | 'calculations';
  action?: 'create' | 'read' | 'update' | 'delete';
  showQuotas?: boolean;
  fallbackMessage?: string;
}

/**
 * Secure premium guard with backend validation
 */
const SecurePremiumGuard: React.FC<SecurePremiumGuardProps> = ({
  children,
  feature,
  action = 'read',
  showQuotas = true,
  fallbackMessage
}) => {
  const navigate = useNavigate();
  const { validateFeatureAccess, getUsageQuotas, isValidating } = usePremiumSecurity();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [quotas, setQuotas] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const result = await validateFeatureAccess(feature, action);
        setHasAccess(result.canAccess);
        setError(result.reason || null);
        
        if (showQuotas) {
          const quotaData = await getUsageQuotas();
          setQuotas(quotaData);
        }
      } catch (err) {
        setHasAccess(false);
        setError('Failed to validate access');
      }
    };

    checkAccess();
  }, [feature, action, showQuotas, validateFeatureAccess, getUsageQuotas]);

  if (isValidating || hasAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 animate-pulse text-blue-500" />
          <span className="text-sm text-muted-foreground">Verificando permissões...</span>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    const isQuotaLimit = error?.includes('limit reached');
    
    return (
      <div className="space-y-4">
        <Alert variant={isQuotaLimit ? "default" : "destructive"}>
          <Lock className="h-4 w-4" />
          <AlertTitle className="flex items-center">
            {isQuotaLimit ? (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Limite do Plano Gratuito Atingido
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Acesso Premium Necessário
              </>
            )}
          </AlertTitle>
          <AlertDescription>
            {fallbackMessage || error || 'Esta funcionalidade requer acesso premium.'}
          </AlertDescription>
          <div className="mt-4 flex space-x-2">
            <Button 
              onClick={() => navigate('/subscription')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </div>
        </Alert>

        {showQuotas && quotas && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
            <h4 className="font-medium text-sm">Uso do Plano Gratuito:</h4>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Pacientes</span>
                  <span>{quotas.patients.current}/{quotas.patients.limit}</span>
                </div>
                <Progress 
                  value={(quotas.patients.current / quotas.patients.limit) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Planos Alimentares (30 dias)</span>
                  <span>{quotas.mealPlans.current}/{quotas.mealPlans.limit}</span>
                </div>
                <Progress 
                  value={(quotas.mealPlans.current / quotas.mealPlans.limit) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Cálculos (30 dias)</span>
                  <span>{quotas.calculations.current}/{quotas.calculations.limit}</span>
                </div>
                <Progress 
                  value={(quotas.calculations.current / quotas.calculations.limit) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default SecurePremiumGuard;
