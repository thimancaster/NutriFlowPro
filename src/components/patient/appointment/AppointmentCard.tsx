
import React from 'react';
import { Appointment } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { formatAppointmentDate, formatAppointmentTime } from '@/components/appointment/utils/dateUtils';
import { statusColors, statusLabels, typeLabels } from '@/components/appointment/list/constants';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onCancel: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onEdit, onCancel }) => {
  const statusClass = statusColors[appointment.status as keyof typeof statusColors] || '';
  const statusLabel = statusLabels[appointment.status as keyof typeof statusLabels] || appointment.status;
  const typeLabel = typeLabels[appointment.type as keyof typeof typeLabels] || appointment.type;
  
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-medium">{appointment.title || 'Consulta'}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
              <span className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formatAppointmentDate(appointment.date)}
              </span>
              <span className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {formatAppointmentTime(appointment.date)}
              </span>
            </div>
          </div>
          <Badge className={statusClass}>{statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <Badge variant="outline" className="mr-2">{typeLabel}</Badge>
          {appointment.notes && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Observações:</span> {appointment.notes}
            </p>
          )}
        </div>
        
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
