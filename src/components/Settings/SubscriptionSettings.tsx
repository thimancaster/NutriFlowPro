
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { Star } from 'lucide-react';

const SubscriptionSettings = () => {
  const { data: subscription } = useUserSubscription();
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Seu plano atual</h3>
        <div className="mt-4 p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">
                {subscription?.isPremium ? 'Plano Premium' : 'Plano Gratuito'}
              </p>
              {subscription?.isPremium && (
                <p className="text-sm text-gray-600 mt-1">
                  Acesso a todas as funcionalidades premium
                </p>
              )}
            </div>
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={() => navigate('/subscription')}
          className="w-full"
          variant="outline"
        >
          Ver planos disponíveis
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
