
import { User } from '@supabase/supabase-js';
import { PREMIUM_EMAILS } from '@/constants/authConstants';

export const usePremiumStatus = (user: User | null) => {
  // Check if user's email is in the premium list
  const isPremium = user?.email ? PREMIUM_EMAILS.includes(user.email) : false;
  
  // Log premium status for debugging purposes
  if (user?.email) {
    console.log("Status premium para", user.email, ":", isPremium);
  }
  
  return isPremium;
};
