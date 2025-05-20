
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment } from '@/types';
import { useAppointmentQuery } from '@/hooks/appointments/useAppointmentQuery';
import { useToast } from '@/hooks/use-toast';
import { appointmentService } from '@/services';
import AppointmentList from '@/components/appointment/AppointmentList';
import AppointmentFormDialog from '@/components/appointment/AppointmentFormDialog';
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
          title: 'Appointment created',
          description: 'The appointment has been successfully created.',
        });
        setIsFormOpen(false);
        refetch();
      } else {
        toast({
          title: 'Error',
          description: `Failed to create appointment: ${result.message}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${(err as Error).message}`,
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
          title: 'Appointment updated',
          description: 'The appointment has been successfully updated.',
        });
        setIsFormOpen(false);
        setSelectedAppointment(null);
        refetch();
      } else {
        toast({
          title: 'Error',
          description: `Failed to update appointment: ${result.message}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${(err as Error).message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteAppointment = async (id: string): Promise<void> => {
    try {
      const result = await appointmentService.deleteAppointment(id);
      
      if (result.success) {
        toast({
          title: 'Appointment deleted',
          description: 'The appointment has been successfully deleted.',
        });
        refetch();
      } else {
        toast({
          title: 'Error',
          description: `Failed to delete appointment: ${result.message}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${(err as Error).message}`,
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
    <div className="container mx-auto p-6">
      <AppointmentList 
        appointments={appointments || []}
        isLoading={isLoading}
        error={error ? error : null}
        onAddNew={() => setIsFormOpen(true)}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
      />
      
      <AppointmentFormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        appointment={selectedAppointment}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Appointments;
