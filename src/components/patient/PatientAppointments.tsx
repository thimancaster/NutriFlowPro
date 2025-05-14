import React, { useState } from 'react';
import { usePatientAppointments } from '@/hooks/appointments/useAppointmentQuery';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Clock, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AppointmentFormDialog from '@/components/appointment/AppointmentFormDialog';
import { useAppointmentMutations } from '@/hooks/appointments/useAppointmentMutations';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';

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
    app => app.status !== 'canceled' && app.status !== 'completed'
  ) || [];
  
  const pastAppointments = appointments?.filter(
    app => app.status === 'completed'
  ) || [];
  
  const canceledAppointments = appointments?.filter(
    app => app.status === 'canceled'
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
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500">Agendado</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Concluído</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500">Cancelado</Badge>;
      case 'rescheduled':
        return <Badge className="bg-amber-500">Reagendado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const renderAppointmentCard = (appointment: Appointment) => {
    const startTime = typeof appointment.start_time === 'string' 
      ? parseISO(appointment.start_time) 
      : appointment.start_time;
      
    const endTime = typeof appointment.end_time === 'string' 
      ? parseISO(appointment.end_time) 
      : appointment.end_time;
    
    return (
      <Card key={appointment.id} className="mb-3">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{appointment.title || 'Consulta'}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {format(startTime, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                <Clock className="h-3.5 w-3.5 ml-3 mr-1" />
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
              </CardDescription>
            </div>
            {getStatusBadge(appointment.status)}
          </div>
        </CardHeader>
        <CardContent>
          {appointment.notes && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Observações:</span> {appointment.notes}
            </p>
          )}
          
          <div className="flex justify-end mt-3">
            {appointment.status !== 'canceled' && appointment.status !== 'completed' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleEditAppointment(appointment)}
                >
                  Editar
                </Button>
              </>
            )}
            
            {(appointment.status === 'canceled' || appointment.status === 'completed') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditAppointment(appointment)}
              >
                Visualizar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderLoadingState = () => (
    <div className="space-y-3">
      <Skeleton className="h-[120px] w-full" />
      <Skeleton className="h-[120px] w-full" />
      <Skeleton className="h-[120px] w-full" />
    </div>
  );
  
  const renderEmptyState = (message: string) => (
    <div className="text-center py-8 border rounded-lg bg-gray-50">
      <p className="text-gray-500">{message}</p>
    </div>
  );
  
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
            renderLoadingState()
          ) : upcomingAppointments.length === 0 ? (
            renderEmptyState('Não há consultas agendadas para este paciente.')
          ) : (
            upcomingAppointments.map(renderAppointmentCard)
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {isLoading ? (
            renderLoadingState()
          ) : pastAppointments.length === 0 ? (
            renderEmptyState('Não há consultas realizadas para este paciente.')
          ) : (
            pastAppointments.map(renderAppointmentCard)
          )}
        </TabsContent>
        
        <TabsContent value="canceled">
          {isLoading ? (
            renderLoadingState()
          ) : canceledAppointments.length === 0 ? (
            renderEmptyState('Não há consultas canceladas para este paciente.')
          ) : (
            canceledAppointments.map(renderAppointmentCard)
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
