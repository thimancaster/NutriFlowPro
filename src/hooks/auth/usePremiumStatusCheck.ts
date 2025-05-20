
import { useRef, useCallback } from 'react';
import { useAuthStorage } from './useAuthStorage';
import { usePremiumCheck } from '@/hooks/premium';
import { User } from '@supabase/supabase-js';
import { AuthState } from '@/types/auth';

export const usePremiumStatusCheck = () => {
  const { checkPremiumStatus } = usePremiumCheck();
  const { savePremiumStatus, loadPremiumStatus } = useAuthStorage();
  
  // Track if premium check is in progress to prevent multiple simultaneous calls
  const isPremiumCheckingRef = useRef(false);

  const checkUserPremiumStatus = useCallback(async (
    user: User | null, 
    authState: AuthState,
    usageQuota: AuthState['usageQuota'],
    setAuthState: (updater: (prev: AuthState) => AuthState) => void,
    isMountedRef: React.MutableRefObject<boolean>
  ) => {
    if (!user?.id) {
      // Not logged in
      if (isMountedRef.current) {
        setAuthState(prevState => ({
          ...prevState,
          isPremium: false,
          userTier: 'free'
        }));
      }
      return;
    }

    // Skip premium check if one is already in progress
    if (isPremiumCheckingRef.current) {
      return;
    }

    try {
      isPremiumCheckingRef.current = true;
      
      // Try to get premium status from local storage first for instant response
      const cachedStatus = loadPremiumStatus(user.id);
      
      if (cachedStatus) {
        const isPremium = cachedStatus.isPremium;
        const userTier = isPremium ? 'premium' : 'free';
        console.log("Using cached premium status:", isPremium);
        
        // Update state with cached premium status
        if (isMountedRef.current) {
          setAuthState(prevState => ({
            ...prevState,
            isPremium,
            userTier,
            usageQuota: {
              ...usageQuota,
              patients: {
                ...usageQuota.patients,
                limit: isPremium ? Infinity : usageQuota.patients.limit
              },
              mealPlans: {
                ...usageQuota.mealPlans,
                limit: isPremium ? Infinity : usageQuota.mealPlans.limit
              }
            }
          }));
        }
      }
      
      // Make API call to verify premium status in background
      const checkPremiumAsync = async () => {
        try {
          const freshIsPremium = await checkPremiumStatus(user.id);
          const freshUserTier = freshIsPremium ? 'premium' : 'free';
          
          // Cache the result
          savePremiumStatus(user.id, freshIsPremium);
          
          // Update state only if value changed or we were using cached value
          if ((cachedStatus && freshIsPremium !== cachedStatus.isPremium) || !cachedStatus) {
            if (isMountedRef.current) {
              setAuthState(prevState => ({
                ...prevState,
                isPremium: freshIsPremium,
                userTier: freshUserTier,
                usageQuota: {
                  ...usageQuota,
                  patients: {
                    ...usageQuota.patients,
                    limit: freshIsPremium ? Infinity : usageQuota.patients.limit
                  },
                  mealPlans: {
                    ...usageQuota.mealPlans,
                    limit: freshIsPremium ? Infinity : usageQuota.mealPlans.limit
                  }
                }
              }));
            }
          }
        } catch (error) {
          console.error("Error checking premium status:", error);
        } finally {
          isPremiumCheckingRef.current = false;
        }
      };
      
      // Start async check but don't await it
      checkPremiumAsync();
    } catch (error) {
      console.error("Error in premium status check:", error);
      isPremiumCheckingRef.current = false;
      
      // Set default values in case of error
      if (isMountedRef.current) {
        setAuthState(prevState => ({
          ...prevState,
          isPremium: false,
          userTier: 'free'
        }));
      }
    }
  }, [checkPremiumStatus, loadPremiumStatus, savePremiumStatus]);

  return { checkUserPremiumStatus };
};

export default usePremiumStatusCheck;
