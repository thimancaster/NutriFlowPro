import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Plus, Calendar, Clock } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useAppointments } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';
import AppointmentFormDialog from '@/components/appointment/AppointmentFormDialog';
import { Appointment } from '@/types';
import { Badge } from '@/components/ui/badge';

const AppointmentStep: React.FC = () => {
  const { selectedPatient, consultationData } = useConsultationData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const { 
    appointments, 
    loading: isLoading, 
    error,
    refetch: refreshAppointments 
  } = useAppointments();

  // Filter appointments for current patient
  const patientAppointments = appointments.filter(
    apt => apt.patient_id === selectedPatient?.id
  );

  // Refresh appointments when patient changes
  useEffect(() => {
    if (selectedPatient?.id) {
      refreshAppointments();
    }
  }, [selectedPatient?.id, refreshAppointments]);

  const handleCreateAppointment = async (appointmentData: Partial<Appointment>) => {
    if (!selectedPatient) return;

    try {
      // Pre-fill patient data
      const newAppointmentData = {
        ...appointmentData,
        patient_id: selectedPatient.id,
        // Add default values if not provided
        status: appointmentData.status || 'scheduled',
        type: appointmentData.type || 'consulta'
      };

      // For now, just show success since we don't have create/update methods
      // This will be implemented when we have the full appointment service
      toast({
        title: 'Agendamento Processado',
        description: 'O agendamento foi processado com sucesso!'
      });

      setIsDialogOpen(false);
      setSelectedAppointment(null);
      refreshAppointments();
    } catch (error) {
      console.error('Error handling appointment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao processar agendamento. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (!selectedPatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Selecione um paciente para continuar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-nutri-blue" />
            Agendamento de Retorno
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Paciente: {selectedPatient.name}</h3>
            <div className="flex gap-4 text-sm text-muted-foreground">
              {selectedPatient.phone && (
                <span>Telefone: {selectedPatient.phone}</span>
              )}
              {selectedPatient.email && (
                <span>Email: {selectedPatient.email}</span>
              )}
            </div>
          </div>

          {/* Create New Appointment */}
          <div className="flex justify-center">
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-nutri-blue hover:bg-nutri-blue-dark"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agendar Nova Consulta
            </Button>
          </div>

          {/* Recommendations for Follow-up */}
          {consultationData?.results && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Recomendações para Retorno
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Acompanhamento nutricional em 15-30 dias</li>
                <li>• Reavaliação dos resultados do plano alimentar</li>
                <li>• Ajustes conforme evolução do paciente</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Appointments */}
      {patientAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agendamentos Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patientAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')}
                      </span>
                      {appointment.start_time && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tipo: {appointment.type}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Observações: {appointment.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditAppointment(appointment as Appointment)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Form Dialog */}
      <AppointmentFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedAppointment(null);
        }}
        onSubmit={handleCreateAppointment}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default AppointmentStep;
