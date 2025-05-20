
import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onCancel: (id: string) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'scheduled':
      return <Badge className="bg-blue-500">Agendado</Badge>;
    case 'completed':
      return <Badge className="bg-green-500">Concluído</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500">Cancelado</Badge>;
    case 'rescheduled':
      return <Badge className="bg-amber-500">Reagendado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onEdit, onCancel }) => {
  const startTime = appointment.start_time ? 
    (typeof appointment.start_time === 'string' ? parseISO(appointment.start_time) : appointment.start_time) : 
    parseISO(appointment.date);
    
  const endTime = appointment.end_time ? 
    (typeof appointment.end_time === 'string' ? parseISO(appointment.end_time) : appointment.end_time) : 
    parseISO(appointment.date);
  
  return (
    <Card className="mb-3">
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
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2"
                onClick={() => onCancel(appointment.id)}
              >
                Cancelar
              </Button>
              <Button 
                size="sm"
                onClick={() => onEdit(appointment)}
              >
                Editar
              </Button>
            </>
          )}
          
          {(appointment.status === 'cancelled' || appointment.status === 'completed') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(appointment)}
            >
              Visualizar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
