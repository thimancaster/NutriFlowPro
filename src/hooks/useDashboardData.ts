
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface SummaryData {
  totalPatients: number;
  appointmentsToday: number;
  activePlans: number;
  isLoading: boolean;
  error?: string;
  hasError: boolean;
}

// Configuration
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1500;

// Hook to fetch dashboard data with parallel queries for better performance
export const useDashboardData = (): SummaryData => {
  const [totalPatients, setTotalPatients] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [activePlans, setActivePlans] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuth();
  
  // Retry logic for failed queries
  const fetchWithRetry = useCallback(async <T>(
    queryFn: () => Promise<{ data: T | null, count?: number | null, error: any }>,
    attempts = RETRY_ATTEMPTS
  ): Promise<{ count?: number | null, error?: any }> => {
    try {
      const result = await queryFn();
      if (result.error) {
        if (attempts <= 0) {
          return { count: 0, error: result.error };
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(queryFn, attempts - 1);
      }
      
      return { count: result.count, error: null };
    } catch (err) {
      if (attempts <= 0) {
        return { count: 0, error: err };
      }
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(queryFn, attempts - 1);
    }
  }, []);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setHasError(false);
      setError(undefined);
      
      try {
        const today = new Date();
        const startOfToday = startOfDay(today).toISOString();
        const endOfToday = endOfDay(today).toISOString();
        
        // Run all queries in parallel with retry capability
        const [patientsResult, appointmentsResult, plansResult] = await Promise.all([
          // Get total patients count with retry
          fetchWithRetry(() => 
            supabase
              .from('patients')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
          ),
            
          // Get today's appointments count with retry
          fetchWithRetry(() =>
            supabase
              .from('appointments')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('status', 'scheduled')
              .gte('date', startOfToday)
              .lte('date', endOfToday)
          ),
            
          // Get active meal plans count with retry
          fetchWithRetry(() =>
            supabase
              .from('meal_plans')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
          )
        ]);
        
        // Check for errors in any of the results
        const errors = [];
        if (patientsResult.error) errors.push('Erro ao buscar pacientes');
        if (appointmentsResult.error) errors.push('Erro ao buscar agendamentos');
        if (plansResult.error) errors.push('Erro ao buscar planos alimentares');
        
        if (errors.length > 0) {
          setHasError(true);
          setError(errors.join(', '));
        }
          
        // Update state with available values, using 0 for any that failed
        setTotalPatients(patientsResult.count || 0);
        setAppointmentsToday(appointmentsResult.count || 0);
        setActivePlans(plansResult.count || 0);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setHasError(true);
        setError(error?.message || 'Erro ao carregar dados do dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, fetchWithRetry]);
  
  return { 
    totalPatients, 
    appointmentsToday, 
    activePlans, 
    isLoading,
    error,
    hasError 
  };
};
