
import React from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientAppointmentsProps {
  patientId: string;
}

const PatientAppointments = ({ patientId }: PatientAppointmentsProps) => {
  // Now pass the patientId to the useAppointments hook
  const { appointments, isLoading } = useAppointments(patientId);
  const navigate = useNavigate();
  
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Separate appointments into upcoming and past
  const now = new Date();
  const upcomingAppointments = appointments?.filter(
    appt => new Date(appt.start_time) > now
  ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  
  const pastAppointments = appointments?.filter(
    appt => new Date(appt.start_time) <= now
  ).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  
  const handleNewAppointment = () => {
    navigate(`/appointments?patientId=${patientId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-blue"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Agendamentos</h3>
        <Button 
          onClick={handleNewAppointment} 
          className="bg-nutri-blue hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>
      
      <div>
        <h4 className="text-md font-medium mb-3">Próximas Consultas</h4>
        {upcomingAppointments && upcomingAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data e Hora</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{formatDate(appointment.start_time)}</td>
                    <td className="p-2">{appointment.title}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs
                        ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {appointment.status === 'scheduled' ? 'Agendado' :
                         appointment.status === 'completed' ? 'Concluído' :
                         appointment.status === 'cancelled' ? 'Cancelado' : 'Não compareceu'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">Nenhuma consulta agendada.</p>
        )}
      </div>
      
      <div>
        <h4 className="text-md font-medium mb-3">Histórico de Consultas</h4>
        {pastAppointments && pastAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data e Hora</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pastAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{formatDate(appointment.start_time)}</td>
                    <td className="p-2">{appointment.title}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs
                        ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {appointment.status === 'completed' ? 'Concluído' :
                         appointment.status === 'cancelled' ? 'Cancelado' : 'Não compareceu'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">Nenhuma consulta no histórico.</p>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
