
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { useAppointmentQuery } from '@/hooks/appointments/useAppointmentQuery';
import { useUnifiedAppointmentMutations } from '@/hooks/appointments/useUnifiedAppointmentMutations';
import AppointmentFormWrapper from '@/components/appointment/form/AppointmentFormWrapper';
import AppointmentErrorBoundary from '@/components/appointment/AppointmentErrorBoundary';
import EnhancedAppointmentList from '@/components/appointment/EnhancedAppointmentList';
import { useAppointmentNotifications } from '@/hooks/appointments/useAppointmentNotifications';

const Appointments = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { user } = useAuth();
  
  // Fetch appointments with the improved query hook
  const { data: appointments, isLoading, error } = useAppointmentQuery();
  
  // Unified mutations - garante sincronização em TODAS as abas
  const { createAppointment, updateAppointment, deleteAppointment } = useUnifiedAppointmentMutations();
  
  // Notification system
  const { scheduleNotification } = useAppointmentNotifications();
  
  // Type-safe appointment mapping
  const normalizeAppointment = (rawAppointment: any): Appointment => {
    return {
      ...rawAppointment,
      status: rawAppointment.status as AppointmentStatus,
      patientName: rawAppointment.patientName || rawAppointment.patient_name || 'Paciente não encontrado'
    };
  };
  
  const handleCreateAppointment = async (appointmentData: Partial<Appointment>): Promise<void> => {
    if (!user) return;
    
    const result = await createAppointment(appointmentData);
    
    if (result) {
      // Schedule notification for the new appointment
      const normalizedAppointment = normalizeAppointment(result);
      await scheduleNotification(normalizedAppointment);
      setIsFormOpen(false);
    }
  };
  
  const handleUpdateAppointment = async (appointmentData: Partial<Appointment>): Promise<void> => {
    if (!user || !selectedAppointment) return;
    
    await updateAppointment({
      id: selectedAppointment.id,
      data: appointmentData
    });
    
    setIsFormOpen(false);
    setSelectedAppointment(null);
  };
  
  const handleDeleteAppointment = async (id: string): Promise<void> => {
    await deleteAppointment(id);
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

  const handleRefresh = async (): Promise<void> => {
    // Não precisa mais - as mutations já invalidam automaticamente
  };
  
  // Normalize appointments for type safety
  const normalizedAppointments = (appointments || []).map(normalizeAppointment);
  
  return (
    <AppointmentErrorBoundary>
      <div className="container mx-auto p-6">
        <EnhancedAppointmentList 
          appointments={normalizedAppointments}
          isLoading={isLoading}
          error={error ? error : null}
          onAddNew={() => setIsFormOpen(true)}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
          onRefresh={handleRefresh}
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
