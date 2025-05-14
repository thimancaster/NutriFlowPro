
import React from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentList from '@/components/appointment/AppointmentList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PatientAppointmentsProps {
  patientId: string;
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patientId }) => {
  const { appointments, isLoading, cancelAppointment, updateAppointment } = useAppointments(patientId);
  const { toast } = useToast();

  const handleCancelAppointment = async (id: string) => {
    try {
      await cancelAppointment(id);
      toast({
        title: 'Agendamento cancelado',
        description: 'O agendamento foi cancelado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o agendamento',
        variant: 'destructive',
      });
    }
  };

  const handleEditAppointment = (appointment: any) => {
    // TODO: Implement edit appointment functionality
    console.log('Edit appointment:', appointment);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Agendamentos do Paciente</h2>
        <Button>
          <PlusCircle className="h-4 w-4 mr-1" />
          Novo Agendamento
        </Button>
      </div>

      <AppointmentList 
        appointments={appointments}
        isLoading={isLoading}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
      />
    </div>
  );
};

export default PatientAppointments;
