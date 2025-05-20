
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { getStatusLabel } from './utils/statusUtils';

export const useAppointmentOperations = (fetchAppointments: () => Promise<void>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const addAppointment = async (newAppointment: Omit<Appointment, 'id'>) => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...newAppointment, user_id: user.id }])
        .select()
        .single();

      if (error) {
        setError(error.message);
        toast({
          title: 'Error adding appointment',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      } else {
        // Fetch the new appointment to ensure patient data is included
        const { data: newAppointmentData, error: fetchError } = await supabase
          .from('appointments')
          .select(`*, patient:patients(*)`)
          .eq('id', data.id)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          toast({
            title: 'Error fetching new appointment',
            description: fetchError.message,
            variant: 'destructive',
          });
          return null;
        } else {
          const typedAppointment = {
            ...newAppointmentData,
            patient: newAppointmentData.patient,
            status: getStatusLabel(newAppointmentData.status)
          };
          
          await fetchAppointments();
          
          toast({
            title: 'Appointment added',
            description: 'Appointment added successfully.',
          });
          
          return typedAppointment;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error.message);
        toast({
          title: 'Error updating appointment',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      } else {
        // Fetch the updated appointment to ensure patient data is included
        const { data: updatedAppointmentData, error: fetchError } = await supabase
          .from('appointments')
          .select(`*, patient:patients(*)`)
          .eq('id', data.id)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          toast({
            title: 'Error fetching updated appointment',
            description: fetchError.message,
            variant: 'destructive',
          });
          return null;
        } else {
          if (updatedAppointmentData) {
            const typedAppointment = {
              ...updatedAppointmentData,
              patient: updatedAppointmentData.patient,
              status: getStatusLabel(updatedAppointmentData.status)
            };
            
            await fetchAppointments();
            
            toast({
              title: 'Appointment updated',
              description: 'Appointment updated successfully.',
            });
            
            return typedAppointment;
          }
        }
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
        toast({
          title: 'Error deleting appointment',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      } else {
        await fetchAppointments();
        
        toast({
          title: 'Appointment deleted',
          description: 'Appointment deleted successfully.',
        });
        
        return true;
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment
  };
};
