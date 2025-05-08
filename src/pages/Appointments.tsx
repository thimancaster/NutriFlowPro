
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import Navbar from '@/components/Navbar';
import AppointmentList from '@/components/appointment/AppointmentList';
import AppointmentFormDialog from '@/components/appointment/AppointmentFormDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar as CalendarIcon, List } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Appointment } from '@/types';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  const { 
    appointments, 
    isLoading, 
    appointmentsByDate,
    createAppointment, 
    updateAppointment, 
    cancelAppointment 
  } = useAppointments();

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleOpenForm = (appointment?: Appointment) => {
    if (appointment) {
      setAppointmentToEdit(appointment);
    } else {
      setAppointmentToEdit(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setAppointmentToEdit(null);
  };

  const handleSaveAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      if (appointmentToEdit) {
        await updateAppointment({
          ...appointmentToEdit,
          ...appointmentData
        });
      } else {
        await createAppointment(appointmentData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save appointment', error);
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      await cancelAppointment(appointment);
    } catch (error) {
      console.error('Failed to cancel appointment', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Helmet>
        <title>Agendamentos - NutriFlow Pro</title>
      </Helmet>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-nutri-blue">Agendamentos</h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handleOpenForm()}
              className="bg-nutri-green hover:bg-nutri-green-dark"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger 
              value="calendar" 
              onClick={() => setView('calendar')}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger 
              value="list" 
              onClick={() => setView('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  locale={ptBR}
                />
              </div>
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
                </h2>
                <AppointmentList 
                  appointments={selectedDate ? appointmentsByDate(selectedDate) : []}
                  isLoading={isLoading}
                  onEdit={handleOpenForm}
                  onCancel={handleCancelAppointment}
                  emptyMessage="Nenhum agendamento para esta data"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Todos os Agendamentos</h2>
              <AppointmentList 
                appointments={appointments}
                isLoading={isLoading}
                onEdit={handleOpenForm}
                onCancel={handleCancelAppointment}
                showDate
                emptyMessage="Nenhum agendamento encontrado"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AppointmentFormDialog 
        isOpen={isFormOpen} 
        onClose={handleCloseForm}
        onSave={handleSaveAppointment}
        appointment={appointmentToEdit}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Appointments;
