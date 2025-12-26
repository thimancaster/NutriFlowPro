import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingCheckResult {
  shouldRedirectToOnboarding: boolean;
  isChecking: boolean;
}

export const useOnboardingCheck = (): OnboardingCheckResult => {
  const { user, loading: authLoading } = useAuth();
  const [shouldRedirectToOnboarding, setShouldRedirectToOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (authLoading) return;
      
      if (!user) {
        setIsChecking(false);
        setShouldRedirectToOnboarding(false);
        return;
      }

      try {
        // Check user_settings for onboarding_completed flag
        const { data: settings, error } = await supabase
          .from('user_settings')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setIsChecking(false);
          return;
        }

        // If no settings record or onboarding not completed
        if (!settings || settings.onboarding_completed !== true) {
          // Also check if user has basic profile data (CRN) as fallback
          const { data: userData } = await supabase
            .from('users')
            .select('crn, clinic_name')
            .eq('id', user.id)
            .maybeSingle();

          // If user has CRN, they likely completed onboarding before this check was added
          if (userData?.crn) {
            // Mark onboarding as completed for existing users
            await supabase
              .from('user_settings')
              .upsert({
                user_id: user.id,
                onboarding_completed: true,
                settings: {}
              }, { onConflict: 'user_id' });
            setShouldRedirectToOnboarding(false);
          } else {
            setShouldRedirectToOnboarding(true);
          }
        } else {
          setShouldRedirectToOnboarding(false);
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading]);

  return { shouldRedirectToOnboarding, isChecking };
};
