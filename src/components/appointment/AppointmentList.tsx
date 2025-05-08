
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  XCircle, 
  Clock, 
  Calendar, 
  User 
} from 'lucide-react';
import { Appointment } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  showDate?: boolean;
  emptyMessage?: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'canceled':
      return 'bg-red-100 text-red-800';
    case 'rescheduled':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusTranslation = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'Agendado';
    case 'completed':
      return 'Concluído';
    case 'canceled':
      return 'Cancelado';
    case 'rescheduled':
      return 'Remarcado';
    default:
      return status;
  }
};

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isLoading,
  onEdit,
  onCancel,
  showDate = false,
  emptyMessage = 'Nenhum agendamento encontrado'
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="mb-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-20 mr-2" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{appointment.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-1" />
                    <span>{appointment.patientName}</span>
                  </div>
                </CardDescription>
              </div>
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusTranslation(appointment.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {showDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {format(new Date(appointment.start_time), "dd 'de' MMMM', 'yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {format(new Date(appointment.start_time), "HH:mm", { locale: ptBR })} - 
                  {format(new Date(appointment.end_time), " HH:mm", { locale: ptBR })}
                </span>
              </div>
              {appointment.notes && (
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Observações:</p>
                  <p className="text-gray-600">{appointment.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {appointment.status !== 'canceled' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => onEdit(appointment)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onCancel(appointment)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </>
            )}
            {appointment.status === 'canceled' && (
              <span className="text-sm text-gray-500">Agendamento cancelado</span>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentList;
