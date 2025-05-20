
import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  completed: 'bg-green-100 text-green-800 hover:bg-green-200',
  cancelled: 'bg-red-100 text-red-800 hover:bg-red-200',
  noshow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  rescheduled: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
};

const statusLabels = {
  scheduled: 'Agendado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  noshow: 'Não Compareceu',
  rescheduled: 'Reagendado'
};

const typeLabels = {
  initial: 'Avaliação Inicial',
  followup: 'Acompanhamento',
  reevaluation: 'Reavaliação',
  other: 'Outro'
};

interface AppointmentItemProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ appointment, onEdit, onDelete }) => {
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

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
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
            <Badge variant="outline" className={statusColors[appointment.status as keyof typeof statusColors] || ''}>
              {statusLabels[appointment.status as keyof typeof statusLabels] || appointment.status}
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
  );
};

export default memo(AppointmentItem);
