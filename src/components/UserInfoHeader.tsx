
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { Star, Crown } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  crn: string | null;
  email: string;
}

const UserInfoHeader = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { data: subscription } = useUserSubscription();
  
  useEffect(() => {
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
          setUserProfile(profile as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Loading state
  if (!userProfile) {
    return (
      <div className="bg-blue-50 p-4 flex justify-between items-center animate-pulse">
        <div className="h-6 bg-blue-200 rounded w-64"></div>
      </div>
    );
  }

  return (
    <div className={`p-4 flex justify-between items-center ${subscription?.isPremium ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200' : 'bg-blue-50'}`}>
      <div className="flex items-center space-x-4">
        <div>
          <span className="font-bold">Nutricionista:</span> {userProfile.name || 'Usuário'}
          {userProfile.crn && <Badge variant="secondary" className="ml-2">CRN: {userProfile.crn}</Badge>}
          
          {subscription?.isPremium && (
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
      
      {!subscription?.isPremium && (
        <a 
          href="/subscription" 
          className="text-sm text-nutri-blue hover:text-nutri-blue-dark flex items-center"
        >
          <Star className="h-4 w-4 mr-1" />
          Upgrade para Premium
        </a>
      )}
    </div>
  );
};

export default UserInfoHeader;
