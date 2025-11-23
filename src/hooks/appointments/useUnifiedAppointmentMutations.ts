import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { appointmentService } from '@/services/appointmentService';
import { Appointment } from '@/types/appointment';

/**
 * Hook unificado para todas as operações de mutação de appointments
 * Garante que TODOS os caches sejam invalidados após qualquer operação
 */
export const useUnifiedAppointmentMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Invalida TODOS os queries relacionados a appointments
   * Isso garante sincronização entre Lista, Calendário, Interativo e Analytics
   */
  const invalidateAllAppointmentQueries = async () => {
    // Invalida todos os queries que começam com 'appointments'
    await queryClient.invalidateQueries({ 
      queryKey: ['appointments'],
      refetchType: 'active' // Só refetch queries ativas (visíveis)
    });
    
    // Invalida também analytics
    await queryClient.invalidateQueries({ 
      queryKey: ['appointment-analytics'],
      refetchType: 'active'
    });
  };

  // CREATE Mutation
  const createMutation = useMutation({
    mutationFn: async (appointmentData: Partial<Appointment>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const result = await appointmentService.createAppointment({
        ...appointmentData,
        user_id: user.id
      });

      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar agendamento');
      }

      return result.data;
    },
    onSuccess: async () => {
      toast({
        title: 'Sucesso',
        description: 'Agendamento criado com sucesso!',
      });
      await invalidateAllAppointmentQueries();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // UPDATE Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      const result = await appointmentService.updateAppointment(id, data);

      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar agendamento');
      }

      return result.data;
    },
    onSuccess: async (_, variables) => {
      toast({
        title: 'Sucesso',
        description: 'Agendamento atualizado com sucesso!',
      });
      await invalidateAllAppointmentQueries();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar agendamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // DELETE Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await appointmentService.deleteAppointment(id);

      if (!result.success) {
        throw new Error(result.message || 'Erro ao excluir agendamento');
      }

      return id;
    },
    onSuccess: async () => {
      toast({
        title: 'Sucesso',
        description: 'Agendamento excluído com sucesso!',
      });
      await invalidateAllAppointmentQueries();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir agendamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    createAppointment: createMutation.mutateAsync,
    updateAppointment: updateMutation.mutateAsync,
    deleteAppointment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};
