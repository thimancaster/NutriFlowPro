
import React from 'react';
import { Crown } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PremiumRequiredAlertProps {
  referrer?: string;
  navigate: Function;
}

/**
 * Alert component for premium required features
 */
const PremiumRequiredAlert: React.FC<PremiumRequiredAlertProps> = ({ referrer, navigate }) => (
  <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
    <AlertTitle className="flex items-center">
      <Crown className="h-4 w-4 mr-2" />
      Funcionalidade Premium
    </AlertTitle>
    <AlertDescription>
      A funcionalidade que você tentou acessar está disponível apenas para usuários premium.
    </AlertDescription>
    {referrer && (
      <div className="mt-2">
        <Button variant="outline" size="sm" className="mr-2" onClick={() => navigate(referrer)}>
          Voltar
        </Button>
      </div>
    )}
  </Alert>
);

export default PremiumRequiredAlert;
