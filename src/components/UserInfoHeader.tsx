
import React, { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useAuthState } from '@/hooks/useAuthState';
import { Star, Crown, Shield, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  name: string | null;
  crn: string | null;
  email: string;
  photo_url: string | null;
}

const UserInfoHeader = () => {
  const { data: subscription, refetchSubscription, isLoading: subscriptionLoading } = useUserSubscription();
  const { user, isPremium: isAuthPremium } = useAuthState();
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  
  // Combinar as duas verificações para status premium
  const isPremium = isAuthPremium || (subscription?.isPremium || false);
  
  useEffect(() => {
    // Força renovação dos dados da assinatura quando o componente monta
    refetchSubscription();
    
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          console.log("Perfil do usuário carregado:", profile);
          setUserProfile(profile as UserProfile);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };
    
    fetchUserProfile();
  }, [refetchSubscription, user?.id]);

  // Debug log para verificar status premium
  useEffect(() => {
    console.log("Status premium no UserInfoHeader:", {
      isPremium,
      isAuthPremium,
      subscriptionPremium: subscription?.isPremium,
      email: user?.email
    });
  }, [isPremium, isAuthPremium, subscription?.isPremium, user?.email]);

  // Estado de carregamento
  if (subscriptionLoading || !userProfile) {
    return (
      <div className="bg-blue-50 p-4 flex justify-between items-center animate-pulse">
        <div className="h-6 bg-blue-200 rounded w-64"></div>
      </div>
    );
  }

  return (
    <div className={`p-4 flex justify-between items-center ${isPremium 
      ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200' 
      : 'bg-blue-50'}`}>
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
          {userProfile?.photo_url ? (
            <AvatarImage src={userProfile.photo_url} alt={userProfile.name || 'Usuário'} />
          ) : (
            <AvatarFallback className="bg-blue-100">
              <User className="h-5 w-5 text-blue-500" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <span className="font-bold">Nutricionista:</span> {userProfile.name || 'Usuário'}
          {userProfile.crn && <Badge variant="secondary" className="ml-2">CRN: {userProfile.crn}</Badge>}
          
          {isPremium && (
            <Badge 
              variant="outline" 
              className="ml-2 bg-gradient-to-r from-amber-100 to-yellow-200 text-yellow-800 border-yellow-300 flex items-center gap-1 shadow-sm"
            >
              <Crown className="h-3 w-3 text-amber-500 fill-yellow-400" />
              Premium
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        {!isPremium && (
          <Link 
            to="/subscription" 
            className="text-sm text-nutri-blue hover:text-nutri-blue-dark flex items-center mr-4"
          >
            <Star className="h-4 w-4 mr-1" />
            Upgrade para Premium
          </Link>
        )}

        {isPremium && (
          <div className="text-sm text-amber-700 flex items-center mr-4">
            <Shield className="h-4 w-4 mr-1 text-amber-500" />
            Benefícios Premium Ativos
          </div>
        )}
        
        <Link 
          to="/settings" 
          className="text-sm bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Configurações
        </Link>
      </div>
    </div>
  );
};

export default UserInfoHeader;
