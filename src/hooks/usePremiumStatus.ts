
import { User } from '@supabase/supabase-js';
import { PREMIUM_EMAILS } from '@/constants/authConstants';
import { useMemo } from 'react';

export const usePremiumStatus = (user: User | null) => {
  // Verifica de forma memorizada se o email do usuário está na lista premium
  const isPremium = useMemo(() => {
    if (!user?.email) return false;
    return PREMIUM_EMAILS.includes(user.email);
  }, [user?.email]);
  
  return isPremium;
};
