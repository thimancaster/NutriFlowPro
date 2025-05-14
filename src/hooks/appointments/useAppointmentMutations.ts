
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentType } from '@/types/appointment';
import { useToast } from '@/hooks/use-toast';

// Function to format dates for Supabase
const formatDateForSupabase = (date: Date): string => {
  return date.toISOString();
};

export const useAppointmentMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      // Format the date for Supabase
      const formattedData = {
        ...appointmentData,
        date: formatDateForSupabase(appointmentData.date)
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
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Format the date for Supabase if it exists
      const formattedData = {
        ...data,
        date: data.date ? formatDateForSupabase(data.date) : undefined
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
  const deleteAppointmentMutation = useMutation({
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

  return {
    createAppointment: createAppointmentMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    deleteAppointment: deleteAppointmentMutation.mutate,
    isCreating: createAppointmentMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
    isDeleting: deleteAppointmentMutation.isPending,
  };
};
