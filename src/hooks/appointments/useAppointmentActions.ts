
import { useState } from 'react';
import { useAppointmentMutations } from './useAppointmentMutations';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';

export const useAppointmentActions = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const { toast } = useToast();
  const { createAppointment, updateAppointment, cancelAppointment } = useAppointmentMutations();
  
  // Open dialog to create a new appointment
  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setFormDialogOpen(true);
  };
  
  // Open dialog to edit an existing appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormDialogOpen(true);
  };
  
  // Close the form dialog
  const handleCloseDialog = () => {
    setFormDialogOpen(false);
    setSelectedAppointment(null);
  };
  
  // Save appointment (create or update)
  const handleSaveAppointment = async (data: Partial<Appointment>) => {
    try {
      if (selectedAppointment?.id) {
        await updateAppointment.mutateAsync({
          id: selectedAppointment.id,
          data
        });
      } else {
        await createAppointment.mutateAsync(data);
      }
      
      toast({
        title: selectedAppointment ? 'Agendamento atualizado' : 'Agendamento criado',
        description: selectedAppointment 
          ? 'As alterações foram salvas com sucesso.' 
          : 'O novo agendamento foi criado com sucesso.',
      });
      
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível salvar o agendamento: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  // Cancel an appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment.mutateAsync(appointmentId);
      
      toast({
        title: 'Agendamento cancelado',
        description: 'O agendamento foi cancelado com sucesso.',
      });
    } catch (error: any) {
      console.error('Error canceling appointment:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível cancelar o agendamento: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  return {
    selectedAppointment,
    formDialogOpen,
    handleNewAppointment,
    handleEditAppointment,
    handleCloseDialog,
    handleSaveAppointment,
    handleCancelAppointment,
    isSaving: createAppointment.isPending || updateAppointment.isPending,
    isCanceling: cancelAppointment.isPending
  };
};
