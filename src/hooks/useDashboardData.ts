
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  activePlans: number;
  isLoading: boolean;
  error: Error | null;
}

export const useDashboardData = (): DashboardStats => {
  const { user } = useAuth();
  const userId = user?.id;
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats', userId],
    queryFn: async () => {
      if (!userId) {
        return { totalPatients: 0, appointmentsToday: 0, activePlans: 0 };
      }
      
      // Fetch total patients count
      const { count: totalPatients, error: patientsError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (patientsError) throw patientsError;
      
      // Fetch appointments for today
      const { count: appointmentsToday, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .gte('date', `${today}T00:00:00`)
        .lte('date', `${today}T23:59:59`);
        
      if (appointmentsError) throw appointmentsError;
      
      // Fetch active meal plans
      const { count: activePlans, error: plansError } = await supabase
        .from('meal_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (plansError) throw plansError;
      
      return {
        totalPatients: totalPatients || 0,
        appointmentsToday: appointmentsToday || 0,
        activePlans: activePlans || 0,
      };
    },
    enabled: !!userId,
    staleTime: 60000, // Cache for 1 minute
  });
  
  return {
    totalPatients: data?.totalPatients || 0,
    appointmentsToday: data?.appointmentsToday || 0,
    activePlans: data?.activePlans || 0,
    isLoading,
    error: error as Error | null,
  };
};
