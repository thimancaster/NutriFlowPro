
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
      <div className="bg-muted/30 p-4 flex justify-between items-center border-b border-border">
        <div className="animate-pulse flex items-center">
          <div className="h-10 w-10 bg-muted rounded-full"></div>
          <div className="ml-4 h-4 bg-muted rounded w-48"></div>
        </div>
        <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`p-4 flex justify-between items-center transition-all duration-300 border-b border-border ${isPremium 
      ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200' 
      : 'bg-muted/30'}`}>
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10 border-2 border-background shadow-lg ring-2 ring-primary/20 transition-all duration-300 hover:scale-110 hover:shadow-xl">
          {userProfile?.photo_url ? (
            <AvatarImage 
              src={userProfile.photo_url} 
              alt={userProfile.name || 'Usuário'}
              className="hover-lift"
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-primary to-nutri-blue text-primary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <span className="font-bold text-foreground dark:text-gray-800">Nutricionista:</span> 
          <span className="text-muted-foreground dark:text-gray-700"> {userProfile?.name || user?.email?.split('@')[0] || 'Usuário'}</span>
          {userProfile?.crn && (
            <Badge 
              variant="secondary" 
              className="ml-2 hover-scale"
            >
              CRN: {userProfile.crn}
            </Badge>
          )}
          
          {isPremium && (
            <Badge 
              variant="outline" 
              className="ml-2 bg-gradient-to-r from-amber-100 to-yellow-200 text-yellow-800 border-yellow-300 flex items-center gap-1 shadow-sm hover-scale"
            >
              <Crown className="h-3 w-3 text-amber-500 fill-yellow-400" />
              Premium
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {!isPremium && (
          <Link 
            to="/subscription" 
            className="text-sm text-primary hover:text-primary/80 flex items-center transition-all duration-200 hover:scale-105"
          >
            <Star className="h-4 w-4 mr-1" />
            Upgrade para Premium
          </Link>
        )}

        {isPremium && (
          <div className="text-sm text-amber-700 dark:text-gray-800 flex items-center">
            <Shield className="h-4 w-4 mr-1 text-amber-500 dark:text-amber-600" />
            Benefícios Premium Ativos
          </div>
        )}
        
        <Link 
          to="/settings" 
          className="text-sm bg-background px-3 py-1 rounded border border-border hover:bg-muted transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-1 text-foreground"
        >
          <Settings className="h-3 w-3" />
          Configurações
        </Link>
      </div>
    </div>
  );
};

export default UserInfoHeader;
