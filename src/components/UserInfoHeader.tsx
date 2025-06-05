
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useAuthState } from '@/hooks/useAuthState';
import { Star, Crown, Shield, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string | null;
  crn: string | null;
  email: string;
  photo_url: string | null;
}

const UserInfoHeader = () => {
  const { toast } = useToast();
  const { data: subscription, isLoading: subscriptionLoading } = useUserSubscription();
  const { user, isPremium: isAuthPremium } = useAuthState();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Combinar as duas verificações para status premium
  const isPremium = isAuthPremium || (subscription?.isPremium || false);
  
  useEffect(() => {
    // Função para buscar o perfil do usuário
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingProfile(true);
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          return;
        }
          
        if (profile) {
          setUserProfile(profile as UserProfile);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, [user?.id]);

  // Estado de carregamento
  if ((subscriptionLoading || isLoadingProfile) && !userProfile) {
    return (
      <div className="bg-blue-50 dark:bg-dark-bg-card p-4 flex justify-between items-center dark:border-b dark:border-dark-border-primary">
        <div className="animate-pulse flex items-center">
          <div className="h-10 w-10 bg-blue-200 dark:bg-dark-bg-surface rounded-full"></div>
          <div className="ml-4 h-4 bg-blue-200 dark:bg-dark-bg-surface rounded w-48"></div>
        </div>
        <div className="h-8 bg-blue-200 dark:bg-dark-bg-surface rounded w-32 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`p-4 flex justify-between items-center transition-all duration-300 ${isPremium 
      ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 dark:from-dark-bg-card dark:to-dark-bg-elevated dark:border-dark-border-accent' 
      : 'bg-blue-50 dark:bg-dark-bg-card dark:border-b dark:border-dark-border-primary'}`}>
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10 border-2 border-white dark:border-dark-border-secondary shadow-lg ring-2 ring-blue-500/20 dark:ring-dark-accent-green/30 transition-all duration-300 hover:scale-110 hover:shadow-xl dark:hover:shadow-dark-glow">
          {userProfile?.photo_url ? (
            <AvatarImage 
              src={userProfile.photo_url} 
              alt={userProfile.name || 'Usuário'}
              className="hover-lift"
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-dark-accent-green dark:to-emerald-600 text-white">
              <User className="h-5 w-5 text-white" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <span className="font-bold dark:text-dark-text-primary">Nutricionista:</span> 
          <span className="dark:text-dark-text-secondary"> {userProfile?.name || user?.email?.split('@')[0] || 'Usuário'}</span>
          {userProfile?.crn && (
            <Badge 
              variant="secondary" 
              className="ml-2 hover-scale dark:bg-dark-bg-surface dark:text-dark-text-primary dark:border-dark-border-secondary"
            >
              CRN: {userProfile.crn}
            </Badge>
          )}
          
          {isPremium && (
            <Badge 
              variant="outline" 
              className="ml-2 bg-gradient-to-r from-amber-100 to-yellow-200 text-yellow-800 border-yellow-300 flex items-center gap-1 shadow-sm hover-scale dark:from-dark-accent-green/10 dark:to-emerald-500/10 dark:text-dark-accent-green dark:border-dark-accent-green/30 dark:bg-dark-bg-elevated"
            >
              <Crown className="h-3 w-3 text-amber-500 dark:text-dark-accent-green fill-yellow-400 dark:fill-dark-accent-green/30" />
              Premium
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {!isPremium && (
          <Link 
            to="/subscription" 
            className="text-sm text-nutri-blue hover:text-nutri-blue-dark dark:text-dark-accent-green dark:hover:text-emerald-400 flex items-center transition-all duration-200 hover:scale-105"
          >
            <Star className="h-4 w-4 mr-1" />
            Upgrade para Premium
          </Link>
        )}

        {isPremium && (
          <div className="text-sm text-amber-700 dark:text-dark-accent-green flex items-center">
            <Shield className="h-4 w-4 mr-1 text-amber-500 dark:text-dark-accent-green" />
            Benefícios Premium Ativos
          </div>
        )}
        
        <Link 
          to="/settings" 
          className="text-sm bg-white dark:bg-dark-bg-elevated px-3 py-1 rounded border border-gray-300 dark:border-dark-border-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-surface transition-all duration-200 hover:scale-105 hover:shadow-md dark:hover:shadow-dark-md flex items-center gap-1 dark:text-dark-text-primary"
        >
          <Settings className="h-3 w-3" />
          Configurações
        </Link>
      </div>
    </div>
  );
};

export default UserInfoHeader;
