
import React from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Utensils, Crown } from 'lucide-react';

interface UsageQuotaDisplayProps {
  title: string;
  used: number;
  limit: number;
  icon: React.ReactNode;
}

const UsageQuotaDisplay: React.FC<UsageQuotaDisplayProps> = ({
  title,
  used,
  limit,
  icon
}) => {
  const percentage = limit === Infinity ? 0 : (used / limit) * 100;
  const isPremium = limit === Infinity;
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {icon}
          <span className="ml-2 text-sm font-medium">{title}</span>
        </div>
        <div className="text-sm text-gray-500">
          {isPremium ? (
            <span className="flex items-center text-amber-600">
              <Crown className="h-3 w-3 mr-1" />
              Ilimitado
            </span>
          ) : (
            `${used} de ${limit}`
          )}
        </div>
      </div>
      
      {!isPremium && (
        <Progress 
          value={percentage} 
          className={`h-2 ${percentage > 80 ? 'bg-red-100' : 'bg-gray-100'}`} 
          indicatorClassName={percentage > 80 ? 'bg-red-500' : 'bg-blue-500'} 
        />
      )}
    </div>
  );
};

const UsageLimits: React.FC = () => {
  const { isPremiumUser, getPatientsQuota, getMealPlansQuota } = useFeatureAccess();
  const patientsQuota = getPatientsQuota();
  const mealPlansQuota = getMealPlansQuota();
  const navigate = useNavigate();
  
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {isPremiumUser ? (
            <>
              <Crown className="h-5 w-5 text-amber-500 mr-2" />
              Plano Premium
            </>
          ) : (
            'Limites de Uso'
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UsageQuotaDisplay
          title="Pacientes"
          used={patientsQuota.used}
          limit={patientsQuota.limit}
          icon={<Users className="h-4 w-4 text-blue-500" />}
        />
        
        <UsageQuotaDisplay
          title="Planos Alimentares"
          used={mealPlansQuota.used}
          limit={mealPlansQuota.limit}
          icon={<Utensils className="h-4 w-4 text-green-500" />}
        />
        
        {!isPremiumUser && (
          <Button 
            onClick={() => navigate('/subscription')}
            className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600"
            size="sm"
          >
            Remover Limites
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageLimits;
