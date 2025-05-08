
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { AppointmentType } from '@/types';

export const useAppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAppointmentTypes = useCallback(async () => {
    if (!user) {
      setAppointmentTypes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Use type casting to work around the table name not being in the TypeScript types yet
      const { data, error } = await (supabase
        .from('appointment_types' as any)
        .select('*')
        .eq('user_id', user.id) as any);
        
      if (error) {
        console.error('Error fetching appointment types:', error);
        throw error;
      }
      
      // Cast to the correct type
      setAppointmentTypes(data as AppointmentType[]);
    } catch (error) {
      console.error('Error in fetchAppointmentTypes:', error);
      setAppointmentTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointmentTypes();
  }, [fetchAppointmentTypes]);

  const createAppointmentType = async (data: Partial<AppointmentType>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const { error } = await (supabase
        .from('appointment_types' as any)
        .insert({
          ...data,
          user_id: user.id
        }) as any);
        
      if (error) throw error;
      
      await fetchAppointmentTypes();
      return { success: true };
    } catch (error: any) {
      console.error('Error creating appointment type:', error);
      return { success: false, error: error.message };
    }
  };

  const updateAppointmentType = async (id: string, data: Partial<AppointmentType>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const { error } = await (supabase
        .from('appointment_types' as any)
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id) as any);
        
      if (error) throw error;
      
      await fetchAppointmentTypes();
      return { success: true };
    } catch (error: any) {
      console.error('Error updating appointment type:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteAppointmentType = async (id: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const { error } = await (supabase
        .from('appointment_types' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) as any);
        
      if (error) throw error;
      
      await fetchAppointmentTypes();
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting appointment type:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    appointmentTypes,
    isLoading,
    fetchAppointmentTypes,
    createAppointmentType,
    updateAppointmentType,
    deleteAppointmentType
  };
};
