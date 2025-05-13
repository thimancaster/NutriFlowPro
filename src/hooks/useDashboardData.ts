
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

// Hook to fetch dashboard data with parallel queries for better performance
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
        const today = new Date();
        const startOfToday = startOfDay(today).toISOString();
        const endOfToday = endOfDay(today).toISOString();
        
        // Run all queries in parallel for better performance
        const [patientsResult, appointmentsResult, plansResult] = await Promise.all([
          // Get total patients count
          supabase
            .from('patients')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
            
          // Get today's appointments count
          supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'scheduled')
            .gte('date', startOfToday)
            .lte('date', endOfToday),
            
          // Get active meal plans count
          supabase
            .from('meal_plans')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);
        
        // Handle any errors from the queries
        if (patientsResult.error) throw patientsResult.error;
        if (appointmentsResult.error) throw appointmentsResult.error;
        if (plansResult.error) throw plansResult.error;
          
        setTotalPatients(patientsResult.count || 0);
        setAppointmentsToday(appointmentsResult.count || 0);
        setActivePlans(plansResult.count || 0);
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
