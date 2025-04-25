
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  name: string | null;
  crn: string | null;
  email: string;
}

const UserInfoHeader = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
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
    <div className="bg-blue-50 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div>
          <span className="font-bold">Nutricionista:</span> {userProfile.name || 'Usuário'}
          {userProfile.crn && <Badge variant="secondary" className="ml-2">CRN: {userProfile.crn}</Badge>}
        </div>
      </div>
    </div>
  );
};

export default UserInfoHeader;
