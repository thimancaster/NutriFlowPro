
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface SummaryData {
  totalPatients: number;
  appointmentsToday: number;
  activePlans: number;
  isLoading: boolean;
}

// Hook to fetch dashboard data
export const useDashboardData = (): SummaryData => {
  const [totalPatients, setTotalPatients] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [activePlans, setActivePlans] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Get total patients count
        const { count: patientsCount, error: patientsError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (patientsError) throw patientsError;
        
        // Get today's appointments count
        const today = new Date();
        const startOfToday = startOfDay(today).toISOString();
        const endOfToday = endOfDay(today).toISOString();
        
        const { count: appointmentsCount, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'scheduled')
          .gte('start_time', startOfToday)
          .lte('start_time', endOfToday);
        
        if (appointmentsError) throw appointmentsError;
        
        // Get active meal plans count
        const { count: plansCount, error: plansError } = await supabase
          .from('meal_plans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (plansError) throw plansError;
          
        setTotalPatients(patientsCount || 0);
        setAppointmentsToday(appointmentsCount || 0);
        setActivePlans(plansCount || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  return { 
    totalPatients, 
    appointmentsToday, 
    activePlans, 
    isLoading 
  };
};
