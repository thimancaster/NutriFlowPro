
import React, { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useAuthState } from '@/hooks/useAuthState';
import { Star, Crown, Shield, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
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
        
        if (!user) {
          console.error("Nenhum usuário autenticado encontrado");
          return;
        }
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar suas informações de perfil.",
            variant: "destructive"
          });
          return;
        }
          
        if (profile) {
          console.log("Perfil do usuário carregado:", profile);
          setUserProfile(profile as UserProfile);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };
    
    fetchUserProfile();
  }, [refetchSubscription, user?.id, toast]);

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
    <div className={`p-4 flex justify-between items-center animate-fade-in ${isPremium 
      ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200' 
      : 'bg-blue-50'}`}>
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10 border-2 border-white shadow-lg ring-2 ring-blue-500/20 transition-all duration-300 hover:scale-110 hover:shadow-xl">
          {userProfile?.photo_url ? (
            <AvatarImage 
              src={userProfile.photo_url} 
              alt={userProfile.name || 'Usuário'}
              onError={(e) => {
                console.error("Error loading avatar image:", e);
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
              className="hover-lift"
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <User className="h-5 w-5 text-white" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <span className="font-bold">Nutricionista:</span> {userProfile.name || 'Usuário'}
          {userProfile.crn && <Badge variant="secondary" className="ml-2 hover-scale">CRN: {userProfile.crn}</Badge>}
          
          {isPremium && (
            <Badge 
              variant="outline" 
              className="ml-2 bg-gradient-to-r from-amber-100 to-yellow-200 text-yellow-800 border-yellow-300 flex items-center gap-1 shadow-sm hover-scale"
            >
              <Crown className="h-3 w-3 text-amber-500 fill-yellow-400 animate-pulse-soft" />
              Premium
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {!isPremium && (
          <Link 
            to="/subscription" 
            className="text-sm text-nutri-blue hover:text-nutri-blue-dark flex items-center transition-all duration-200 hover:scale-105"
          >
            <Star className="h-4 w-4 mr-1 animate-pulse-soft" />
            Upgrade para Premium
          </Link>
        )}

        {isPremium && (
          <div className="text-sm text-amber-700 flex items-center">
            <Shield className="h-4 w-4 mr-1 text-amber-500 animate-pulse-soft" />
            Benefícios Premium Ativos
          </div>
        )}
        
        <Link 
          to="/settings" 
          className="text-sm bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-1"
        >
          <Settings className="h-3 w-3" />
          Configurações
        </Link>
      </div>
    </div>
  );
};

export default UserInfoHeader;
