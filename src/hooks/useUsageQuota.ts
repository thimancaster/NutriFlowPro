
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Define limits for free tier
export const FREE_TIER_LIMITS = {
  patients: 5,
  mealPlans: 3
};

export interface UsageQuota {
  patients: {
    used: number;
    limit: number;
  };
  mealPlans: {
    used: number;
    limit: number;
  };
}

export const useUsageQuota = (user: User | null, isPremium: boolean) => {
  const [usageQuota, setUsageQuota] = useState<UsageQuota>({
    patients: {
      used: 0,
      limit: FREE_TIER_LIMITS.patients
    },
    mealPlans: {
      used: 0,
      limit: FREE_TIER_LIMITS.mealPlans
    }
  });
  
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!user?.id) return;
      
      try {
        // Get patient count
        const { count: patientCount, error: patientError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        // Get meal plan count
        const { count: mealPlanCount, error: mealPlanError } = await supabase
          .from('meal_plans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (!patientError && !mealPlanError) {
          setUsageQuota({
            patients: {
              used: patientCount || 0,
              limit: isPremium ? Infinity : FREE_TIER_LIMITS.patients
            },
            mealPlans: {
              used: mealPlanCount || 0,
              limit: isPremium ? Infinity : FREE_TIER_LIMITS.mealPlans
            }
          });
        }
      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
    };
    
    fetchUsageData();
  }, [user, isPremium]);
  
  return usageQuota;
};
