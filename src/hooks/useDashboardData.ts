
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardData = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    patientCount: 0,
    appointmentCount: 0,
    todayAppointments: [],
    recentPatients: [],
    activePlans: 0 // Added active plans count
  });

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use Promise.all to fetch data in parallel
        const [
          patientCountResult,
          appointmentCountResult,
          todayAppointmentsResult,
          recentPatientsResult,
          activePlansResult // Added active meal plans count
        ] = await Promise.all([
          fetchPatientCount(userId),
          fetchAppointmentCount(userId),
          fetchTodayAppointments(userId),
          fetchRecentPatients(userId),
          fetchActivePlans(userId) // Added function call
        ]);

        setDashboardData({
          patientCount: patientCountResult.count || 0,
          appointmentCount: appointmentCountResult.count || 0,
          todayAppointments: todayAppointmentsResult.data || [],
          recentPatients: recentPatientsResult.data || [],
          activePlans: activePlansResult.count || 0 // Added to state
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // Create computed properties for simpler component access
  const totalPatients = dashboardData.patientCount;
  const appointmentsToday = dashboardData.appointmentCount;
  const activePlans = dashboardData.activePlans;

  return { 
    isLoading, 
    error, 
    dashboardData,
    // Expose computed properties for backwards compatibility
    totalPatients,
    appointmentsToday,
    activePlans
  };
};

// Helper functions to fetch specific data
async function fetchPatientCount(userId: string) {
  try {
    const response = await supabase
      .from('patients')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'active');
    
    return { count: response.count || 0, error: response.error };
  } catch (err) {
    console.error('Error fetching patient count:', err);
    return { count: 0, error: err };
  }
}

async function fetchAppointmentCount(userId: string) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
    const response = await supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('date', startOfDay)
      .lte('date', endOfDay);
    
    return { count: response.count || 0, error: response.error };
  } catch (err) {
    console.error('Error fetching appointment count:', err);
    return { count: 0, error: err };
  }
}

// New function to fetch active meal plans count
async function fetchActivePlans(userId: string) {
  try {
    const response = await supabase
      .from('meal_plans')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    
    return { count: response.count || 0, error: response.error };
  } catch (err) {
    console.error('Error fetching active meal plans:', err);
    return { count: 0, error: err };
  }
}

async function fetchTodayAppointments(userId: string) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
    const response = await supabase
      .from('appointments')
      .select(`
        id, date, type, status,
        patients:patient_id (id, name, email)
      `)
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('date', startOfDay)
      .lte('date', endOfDay)
      .order('date', { ascending: true });
    
    return { data: response.data || [], error: response.error };
  } catch (err) {
    console.error('Error fetching today appointments:', err);
    return { data: [], error: err };
  }
}

async function fetchRecentPatients(userId: string) {
  try {
    const response = await supabase
      .from('patients')
      .select('id, name, email, created_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);
    
    return { data: response.data || [], error: response.error };
  } catch (err) {
    console.error('Error fetching recent patients:', err);
    return { data: [], error: err };
  }
}
