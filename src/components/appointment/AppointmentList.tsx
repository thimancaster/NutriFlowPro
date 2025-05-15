import React from 'react';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Edit, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
  onEdit: (appointment: Appointment) => void;
  onCancel: (id: string) => void;
}

const getStatusBadge = (status: string = 'scheduled') => {
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

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isLoading,
  onEdit,
  onCancel
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Carregando agendamentos...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-gray-50">
        <p className="text-gray-500 mb-2">Nenhum agendamento encontrado.</p>
        <p className="text-gray-400 text-sm">Crie novos agendamentos usando o botão acima.</p>
      </div>
    );
  }

  // Group appointments by date for display
  const appointmentsByDate: Record<string, Appointment[]> = {};
  
  appointments.forEach(appointment => {
    if (!appointment.start_time) return;
    
    const startTime = typeof appointment.start_time === 'string'
      ? parseISO(appointment.start_time)
      : appointment.start_time;
      
    const dateKey = format(startTime, 'yyyy-MM-dd');
    
    if (!appointmentsByDate[dateKey]) {
      appointmentsByDate[dateKey] = [];
    }
    appointmentsByDate[dateKey].push(appointment);
  });

  const sortedDateKeys = Object.keys(appointmentsByDate).sort();

  return (
    <div className="space-y-8">
      {sortedDateKeys.map(dateKey => (
        <div key={dateKey} className="mb-6">
          <h3 className="text-xl font-medium mb-3 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-nutri-blue" />
            {format(parseISO(dateKey), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {appointmentsByDate[dateKey]
              .sort((a, b) => {
                const aTime = typeof a.start_time === 'string'
                  ? new Date(a.start_time).getTime()
                  : a.start_time.getTime();
                  
                const bTime = typeof b.start_time === 'string'
                  ? new Date(b.start_time).getTime()
                  : b.start_time.getTime();
                  
                return aTime - bTime;
              })
              .map(appointment => {
                const startTime = typeof appointment.start_time === 'string'
                  ? parseISO(appointment.start_time)
                  : appointment.start_time;
                  
                const endTime = typeof appointment.end_time === 'string'
                  ? parseISO(appointment.end_time)
                  : appointment.end_time;
                  
                // Calculate duration in minutes
                const durationMinutes = Math.round(
                  (endTime.getTime() - startTime.getTime()) / (1000 * 60)
                );
                
                return (
                  <Card key={appointment.id} className={`
                    ${appointment.status === 'canceled' ? 'opacity-70 bg-gray-50' : 'bg-white'}
                    ${appointment.status === 'completed' ? 'border-green-200' : ''}
                  `}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{appointment.title}</CardTitle>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <CardDescription className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 inline text-gray-500" />
                        {format(startTime, 'HH:mm')} até {
                          format(endTime, 'HH:mm')
                        } ({durationMinutes} min)
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="font-medium">Paciente: {appointment.patientName || "Não especificado"}</p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Observações:</span> {appointment.notes}
                        </p>
                      )}
                    </CardContent>
                    
                    <CardFooter className="pt-0 justify-end space-x-2">
                      {appointment.status !== 'canceled' && appointment.status !== 'completed' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onCancel(appointment.id!)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onEdit(appointment)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </>
                      )}
                      
                      {(appointment.status === 'canceled' || appointment.status === 'completed') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(appointment)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentList;
