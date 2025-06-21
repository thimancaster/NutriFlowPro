
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, List, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import EnhancedAppointmentForm from '@/components/appointments/EnhancedAppointmentForm';
import { useEnhancedAppointments } from '@/hooks/useEnhancedAppointments';
import { EnhancedAppointment } from '@/types/appointments';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

const AppointmentsPage: React.FC = () => {
  const {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useEnhancedAppointments();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<EnhancedAppointment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [defaultFormDate, setDefaultFormDate] = useState<Date>();

  const handleNewAppointment = (date?: Date) => {
    setSelectedAppointment(null);
    setDefaultFormDate(date);
    setIsFormOpen(true);
  };

  const handleEditAppointment = (appointment: EnhancedAppointment) => {
    setSelectedAppointment(appointment);
    setDefaultFormDate(new Date(appointment.date));
    setIsFormOpen(true);
  };

  const handleSubmitAppointment = async (data: Partial<EnhancedAppointment>) => {
    if (selectedAppointment) {
      await updateAppointment(selectedAppointment.id, data);
    } else {
      await createAppointment(data);
    }
    setIsFormOpen(false);
    setSelectedAppointment(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAppointment(null);
    setDefaultFormDate(undefined);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner text="Carregando agendamentos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Erro ao carregar agendamentos: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BreadcrumbNav />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie suas consultas e compromissos
          </p>
        </div>
        <Button onClick={() => handleNewAppointment()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <AppointmentCalendar
            appointments={appointments}
            onDateSelect={setSelectedDate}
            onAppointmentClick={handleEditAppointment}
            onNewAppointment={handleNewAppointment}
            selectedDate={selectedDate}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Nenhum agendamento encontrado</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => handleNewAppointment()}
                  >
                    Criar Primeiro Agendamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEditAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{appointment.patient_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')} - {appointment.start_time}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {appointment.status === 'confirmed' ? 'Confirmado' :
                           appointment.status === 'scheduled' ? 'Agendado' :
                           appointment.status === 'completed' ? 'Finalizado' :
                           appointment.status === 'cancelled' ? 'Cancelado' :
                           'Faltou'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EnhancedAppointmentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        appointment={selectedAppointment}
        onSubmit={handleSubmitAppointment}
        defaultDate={defaultFormDate}
      />
    </div>
  );
};

export default AppointmentsPage;
