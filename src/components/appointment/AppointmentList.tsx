import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCcw } from 'lucide-react';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  completed: 'bg-green-100 text-green-800 hover:bg-green-200',
  cancelled: 'bg-red-100 text-red-800 hover:bg-red-200',
  noshow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
};

const statusLabels = {
  scheduled: 'Agendado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  noshow: 'Não Compareceu'
};

const typeLabels = {
  initial: 'Avaliação Inicial',
  followup: 'Acompanhamento',
  reevaluation: 'Reavaliação',
  other: 'Outro'
};

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
  error: Error | null;
  onAddNew: () => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isLoading,
  error,
  onAddNew,
  onEdit,
  onDelete
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };
  
  const formatAppointmentDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };
  
  const formatAppointmentTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "HH:mm", { locale: ptBR });
    } catch (e) {
      console.error("Error formatting time:", e);
      return "";
    }
  };
  
  const sortAppointmentsByDate = (a: Appointment, b: Appointment) => {
    try {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateB.getTime() - dateA.getTime();
    } catch (e) {
      console.error("Error sorting appointments:", e);
      return 0;
    }
  };
  
  const filterAppointmentsByDate = (appointment: Appointment) => {
    if (!selectedDate) return true;
    
    try {
      const appointmentDate = parseISO(appointment.date);
      const selected = new Date(selectedDate);
      
      return (
        appointmentDate.getDate() === selected.getDate() &&
        appointmentDate.getMonth() === selected.getMonth() &&
        appointmentDate.getFullYear() === selected.getFullYear()
      );
    } catch (e) {
      console.error("Error filtering appointments:", e);
      return true;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold">Consultas</CardTitle>
        <Button onClick={onAddNew} className="bg-nutri-green hover:bg-nutri-green-dark">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Consulta
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {error.message}
              <Button variant="link" className="mt-2 p-0" onClick={() => {}}>
                <RefreshCcw className="mr-1 h-3 w-3" /> Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma consulta encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece agendando uma nova consulta para seus pacientes.
            </p>
            <div className="mt-6">
              <Button onClick={onAddNew} className="bg-nutri-green hover:bg-nutri-green-dark">
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Consulta
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments
              .sort(sortAppointmentsByDate)
              .filter(filterAppointmentsByDate)
              .map((appointment) => (
                <div key={appointment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="bg-blue-100 text-blue-800 h-12 w-12 rounded-full flex items-center justify-center font-medium">
                        {formatAppointmentTime(appointment.date || '')}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        {appointment.patient?.name || appointment.patientName || 'Paciente não encontrado'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatAppointmentDate(appointment.date || '')}
                      </p>
                      <div className="flex mt-1 space-x-2">
                        <Badge variant="outline" className={statusColors[appointment.status as keyof typeof statusColors]}>
                          {statusLabels[appointment.status as keyof typeof statusLabels]}
                        </Badge>
                        <Badge variant="outline">
                          {typeLabels[appointment.type as keyof typeof typeLabels] || appointment.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(appointment)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(appointment.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentList;
