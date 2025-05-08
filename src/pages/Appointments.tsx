
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppointments } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import UserInfoHeader from '@/components/UserInfoHeader';
import AppointmentList from '@/components/appointment/AppointmentList';
import AppointmentFormDialog from '@/components/appointment/AppointmentFormDialog';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, RefreshCw } from 'lucide-react';
import { Appointment } from '@/types';

const Appointments = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { appointments, isLoading, fetchAppointments, createAppointment, updateAppointment, deleteAppointment, cancelAppointment, appointmentsByDate } = useAppointments();
  const { toast } = useToast();

  const handleCreateAppointment = async (appointmentData: Partial<Appointment>) => {
    const { success, error } = await createAppointment(appointmentData);
    if (success) {
      toast({
        title: "Consulta Agendada",
        description: "A consulta foi agendada com sucesso."
      });
      setIsFormOpen(false);
    } else {
      toast({
        title: "Erro ao agendar consulta",
        description: error?.message || "Ocorreu um erro ao tentar agendar a consulta.",
        variant: "destructive"
      });
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleUpdateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    const { success, error } = await updateAppointment(id, appointmentData);
    if (success) {
      toast({
        title: "Consulta Atualizada",
        description: "As informações da consulta foram atualizadas com sucesso."
      });
      setIsFormOpen(false);
      setSelectedAppointment(null);
    } else {
      toast({
        title: "Erro ao atualizar consulta",
        description: error?.message || "Ocorreu um erro ao tentar atualizar a consulta.",
        variant: "destructive"
      });
    }
  };

  const handleCancelAppointment = async (id: string) => {
    const { success, error } = await cancelAppointment(id);
    if (success) {
      toast({
        title: "Consulta Cancelada",
        description: "A consulta foi cancelada com sucesso."
      });
    } else {
      toast({
        title: "Erro ao cancelar consulta",
        description: error?.message || "Ocorreu um erro ao tentar cancelar a consulta.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Agendamentos - NutriFlow Pro</title>
      </Helmet>
      <Navbar />
      <UserInfoHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Agendamentos</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => fetchAppointments()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            
            <Button 
              onClick={() => {
                setSelectedAppointment(null);
                setIsFormOpen(true);
              }}
              className="bg-nutri-blue hover:bg-nutri-blue-dark flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="list">
          <TabsList className="mb-4">
            <TabsTrigger value="list" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <AppointmentList 
              appointments={appointments}
              isLoading={isLoading}
              onEdit={handleEditAppointment}
              onCancel={handleCancelAppointment}
            />
          </TabsContent>
          
          <TabsContent value="calendar">
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-center text-gray-500">
                Visualização de calendário em breve!
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {isFormOpen && (
          <AppointmentFormDialog
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedAppointment(null);
            }}
            onSubmit={selectedAppointment 
              ? (data) => handleUpdateAppointment(selectedAppointment.id!, data)
              : handleCreateAppointment
            }
            appointment={selectedAppointment}
          />
        )}
      </main>
    </>
  );
};

export default Appointments;
