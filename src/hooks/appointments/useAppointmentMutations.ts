
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Function to format dates for Supabase
const formatDateForSupabase = (date: Date): string => {
  return date.toISOString();
};

export const useAppointmentMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (appointmentData: any) => {
      // Format dates for Supabase if they exist
      const formattedData = {
        ...appointmentData,
        date: appointmentData.date ? formatDateForSupabase(new Date(appointmentData.date)) : undefined,
        type: appointmentData.type || 'default'
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(formattedData)
        .select();

      if (error) {
        throw new Error(`Error creating appointment: ${error.message}`);
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Consulta agendada',
        description: 'A consulta foi agendada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao agendar consulta',
        description: error.message || 'Ocorreu um erro ao agendar a consulta.',
        variant: 'destructive',
      });
    },
  });

  // Update appointment mutation
  const updateAppointment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Format dates for Supabase if they exist
      const formattedData = {
        ...data,
        date: data.date ? formatDateForSupabase(new Date(data.date)) : undefined
      };

      const { data: updatedData, error } = await supabase
        .from('appointments')
        .update(formattedData)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(`Error updating appointment: ${error.message}`);
      }

      return updatedData[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Consulta atualizada',
        description: 'A consulta foi atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar consulta',
        description: error.message || 'Ocorreu um erro ao atualizar a consulta.',
        variant: 'destructive',
      });
    },
  });

  // Delete appointment mutation
  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting appointment: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Consulta cancelada',
        description: 'A consulta foi cancelada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao cancelar consulta',
        description: error.message || 'Ocorreu um erro ao cancelar a consulta.',
        variant: 'destructive',
      });
    },
  });
  
  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(`Error canceling appointment: ${error.message}`);
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Consulta cancelada',
        description: 'A consulta foi cancelada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao cancelar consulta',
        description: error.message || 'Ocorreu um erro ao cancelar a consulta.',
        variant: 'destructive',
      });
    },
  });

  return {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment: cancelAppointmentMutation,
    isCreating: createAppointment.isPending,
    isUpdating: updateAppointment.isPending,
    isDeleting: deleteAppointment.isPending,
    isCanceling: cancelAppointmentMutation.isPending,
  };
};
