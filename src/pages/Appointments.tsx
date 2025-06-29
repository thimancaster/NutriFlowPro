
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment } from '@/types';
import { useAppointmentQuery } from '@/hooks/appointments/useAppointmentQuery';
import { useToast } from '@/hooks/use-toast';
import { appointmentService } from '@/services';
import AppointmentList from '@/components/appointment/AppointmentList';
import AppointmentFormWrapper from '@/components/appointment/form/AppointmentFormWrapper';
import AppointmentErrorBoundary from '@/components/appointment/AppointmentErrorBoundary';
import { useAppointmentActions } from '@/hooks/appointments/useAppointmentActions';

const Appointments = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch appointments with the improved query hook
  const { data: appointments, isLoading, error, refetch } = useAppointmentQuery();
  
  const handleCreateAppointment = async (appointmentData: Partial<Appointment>): Promise<void> => {
    try {
      if (!user) return;
      
      const result = await appointmentService.createAppointment({
        ...appointmentData,
        user_id: user.id
      });
      
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Agendamento criado com sucesso!',
        });
        setIsFormOpen(false);
        refetch();
      } else {
        toast({
          title: 'Erro',
          description: `Falha ao criar agendamento: ${result.message}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast({
        title: 'Erro',
        description: `Erro inesperado: ${(err as Error).message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateAppointment = async (appointmentData: Partial<Appointment>): Promise<void> => {
    try {
      if (!user || !selectedAppointment) return;
      
      const result = await appointmentService.updateAppointment(
        selectedAppointment.id,
        appointmentData
      );
      
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Agendamento atualizado com sucesso!',
        });
        setIsFormOpen(false);
        setSelectedAppointment(null);
        refetch();
      } else {
        toast({
          title: 'Erro',
          description: `Falha ao atualizar agendamento: ${result.message}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast({
        title: 'Erro',
        description: `Erro inesperado: ${(err as Error).message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteAppointment = async (id: string): Promise<void> => {
    try {
      const result = await appointmentService.deleteAppointment(id);
      
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Agendamento excluído com sucesso!',
        });
        refetch();
      } else {
        toast({
          title: 'Erro',
          description: `Falha ao excluir agendamento: ${result.message}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast({
        title: 'Erro',
        description: `Erro inesperado: ${(err as Error).message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAppointment(null);
  };
  
  const handleSubmit = async (data: Partial<Appointment>): Promise<void> => {
    if (selectedAppointment) {
      await handleUpdateAppointment(data);
    } else {
      await handleCreateAppointment(data);
    }
  };
  
  return (
    <AppointmentErrorBoundary>
      <div className="container mx-auto p-6">
        <AppointmentList 
          appointments={appointments || []}
          isLoading={isLoading}
          error={error ? error : null}
          onAddNew={() => setIsFormOpen(true)}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
        />
        
        <AppointmentFormWrapper
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          appointment={selectedAppointment}
          onSubmit={handleSubmit}
        />
      </div>
    </AppointmentErrorBoundary>
  );
};

export default Appointments;
