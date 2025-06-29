
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { appointmentService } from '@/services/appointmentService';
import { Appointment, AppointmentStatus } from '@/types/appointment';

export const useBulkAppointmentOperations = (onSuccess?: () => Promise<void>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleSelection = (appointmentId: string) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const selectAll = (appointments: Appointment[]) => {
    setSelectedAppointments(appointments.map(app => app.id));
  };

  const clearSelection = () => {
    setSelectedAppointments([]);
  };

  const bulkUpdateStatus = async (status: AppointmentStatus) => {
    if (selectedAppointments.length === 0) return;

    setIsProcessing(true);
    try {
      const promises = selectedAppointments.map(id =>
        appointmentService.updateAppointment(id, { status })
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toast({
          title: 'Operação Concluída',
          description: `${successful} agendamento${successful > 1 ? 's' : ''} ${getStatusLabel(status).toLowerCase()}${successful > 1 ? 's' : ''}`,
        });

        if (onSuccess) await onSuccess();
        clearSelection();
      }

      if (failed > 0) {
        toast({
          title: 'Atenção',
          description: `${failed} operação${failed > 1 ? 'ões' : ''} falharam`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao processar operações em lote',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkReschedule = async (newDate: string, newTime?: string) => {
    if (selectedAppointments.length === 0) return;

    setIsProcessing(true);
    try {
      const updateData: Partial<Appointment> = {
        date: newDate,
        status: 'rescheduled' as AppointmentStatus
      };

      if (newTime) {
        updateData.start_time = `${newDate}T${newTime}`;
      }

      const promises = selectedAppointments.map(id =>
        appointmentService.updateAppointment(id, updateData)
      );

      await Promise.all(promises);

      toast({
        title: 'Reagendamento Concluído',
        description: `${selectedAppointments.length} agendamento${selectedAppointments.length > 1 ? 's' : ''} reagendado${selectedAppointments.length > 1 ? 's' : ''}`,
      });

      if (onSuccess) await onSuccess();
      clearSelection();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao reagendar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedAppointments.length === 0) return;

    setIsProcessing(true);
    try {
      const promises = selectedAppointments.map(id =>
        appointmentService.deleteAppointment(id)
      );

      await Promise.all(promises);

      toast({
        title: 'Exclusão Concluída',
        description: `${selectedAppointments.length} agendamento${selectedAppointments.length > 1 ? 's' : ''} excluído${selectedAppointments.length > 1 ? 's' : ''}`,
      });

      if (onSuccess) await onSuccess();
      clearSelection();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir agendamentos',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusLabel = (status: AppointmentStatus): string => {
    const labels = {
      scheduled: 'Agendado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Faltou',
      rescheduled: 'Reagendado'
    };
    return labels[status] || status;
  };

  return {
    selectedAppointments,
    isProcessing,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkUpdateStatus,
    bulkReschedule,
    bulkDelete
  };
};
