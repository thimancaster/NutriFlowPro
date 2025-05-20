
import React, { useState } from 'react';
import { usePatientAppointments } from '@/hooks/appointments/useAppointmentQuery';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import AppointmentFormDialog from '@/components/appointment/AppointmentFormDialog';
import { useAppointmentMutations } from '@/hooks/appointments/useAppointmentMutations';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';
import AppointmentCard from './appointment/AppointmentCard';
import { LoadingState, EmptyState } from './appointment/AppointmentStates';

interface PatientAppointmentsProps {
  patientId: string;
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patientId }) => {
  const { data: appointments, isLoading, refetch } = usePatientAppointments(patientId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { createAppointment, updateAppointment, cancelAppointment } = useAppointmentMutations();
  const { toast } = useToast();
  
  // Group appointments by status
  const upcomingAppointments = appointments?.filter(
    app => app.status !== 'cancelled' && app.status !== 'completed'
  ) || [];
  
  const pastAppointments = appointments?.filter(
    app => app.status === 'completed'
  ) || [];
  
  const canceledAppointments = appointments?.filter(
    app => app.status === 'cancelled'
  ) || [];
  
  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setIsFormOpen(true);
  };
  
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAppointment(null);
  };
  
  const handleSaveAppointment = async (data: Partial<Appointment>) => {
    try {
      // Add patient_id to the appointment data
      const appointmentData = {
        ...data,
        patient_id: patientId,
      };
      
      if (selectedAppointment?.id) {
        await updateAppointment.mutateAsync({
          id: selectedAppointment.id, 
          data: appointmentData
        });
      } else {
        await createAppointment.mutateAsync(appointmentData);
      }
      
      toast({
        title: selectedAppointment ? 'Agendamento atualizado' : 'Agendamento criado',
        description: 'O agendamento foi salvo com sucesso.',
      });
      
      refetch();
      handleCloseForm();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: `Não foi possível salvar o agendamento: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleCancelAppointment = async (id: string) => {
    try {
      await cancelAppointment.mutateAsync(id);
      
      toast({
        title: 'Agendamento cancelado',
        description: 'O agendamento foi cancelado com sucesso.',
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: `Não foi possível cancelar o agendamento: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Consultas do Paciente</h2>
        <Button onClick={handleNewAppointment} size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="past">Realizadas</TabsTrigger>
          <TabsTrigger value="canceled">Canceladas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            <LoadingState />
          ) : upcomingAppointments.length === 0 ? (
            <EmptyState message="Não há consultas agendadas para este paciente." />
          ) : (
            upcomingAppointments.map(appointment => (
              <AppointmentCard 
                key={appointment.id}
                appointment={appointment}
                onEdit={handleEditAppointment}
                onCancel={handleCancelAppointment}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {isLoading ? (
            <LoadingState />
          ) : pastAppointments.length === 0 ? (
            <EmptyState message="Não há consultas realizadas para este paciente." />
          ) : (
            pastAppointments.map(appointment => (
              <AppointmentCard 
                key={appointment.id}
                appointment={appointment}
                onEdit={handleEditAppointment}
                onCancel={handleCancelAppointment}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="canceled">
          {isLoading ? (
            <LoadingState />
          ) : canceledAppointments.length === 0 ? (
            <EmptyState message="Não há consultas canceladas para este paciente." />
          ) : (
            canceledAppointments.map(appointment => (
              <AppointmentCard 
                key={appointment.id}
                appointment={appointment}
                onEdit={handleEditAppointment}
                onCancel={handleCancelAppointment}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
      
      <AppointmentFormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveAppointment}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default PatientAppointments;
