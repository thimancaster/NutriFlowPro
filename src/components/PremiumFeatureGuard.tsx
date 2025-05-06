
import React from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  featureName: string;
  showUpgradeButton?: boolean;
}

const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
  children,
  featureName,
  showUpgradeButton = true
}) => {
  const { isPremiumUser } = useFeatureAccess();
  const navigate = useNavigate();
  
  if (isPremiumUser) {
    return <>{children}</>;
  }
  
  return (
    <div className="border border-amber-200 rounded-lg p-6 bg-amber-50 flex flex-col items-center text-center">
      <Lock className="h-12 w-12 text-amber-500 mb-2" />
      <h3 className="text-lg font-medium text-amber-800 mb-1">Funcionalidade Premium</h3>
      <p className="text-amber-700 mb-4">
        "{featureName}" está disponível apenas para assinantes premium.
      </p>
      
      {showUpgradeButton && (
        <Button 
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 flex items-center"
        >
          <Crown className="h-4 w-4 mr-2" />
          Fazer Upgrade
        </Button>
      )}
    </div>
  );
};

export default PremiumFeatureGuard;
