
import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { Appointment } from '@/types';
import { formatAppointmentDate, formatTimeBadge } from '../utils/dateUtils';
import { statusColors, statusLabels, typeLabels } from './constants';

interface AppointmentItemProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ appointment, onEdit, onDelete }) => {
  const statusClass = statusColors[appointment.status as keyof typeof statusColors] || '';
  const statusLabel = statusLabels[appointment.status as keyof typeof statusLabels] || appointment.status;
  const typeLabel = typeLabels[appointment.type as keyof typeof typeLabels] || appointment.type;
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg transition-colors magnetic-hover smooth-lift side-expand hover:border-nutri-green dark:hover:border-dark-accent-green hover:bg-gradient-to-r hover:from-transparent hover:to-nutri-green/5 dark:hover:to-dark-accent-green/5">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="bg-blue-100 text-blue-800 h-12 w-12 rounded-full flex items-center justify-center font-medium soft-pulse hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 dark:bg-nutri-blue/20 dark:text-nutri-blue transition-all duration-300">
            {formatTimeBadge(appointment.date)}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-glow-hover transition-all duration-300 hover:text-nutri-green dark:hover:text-dark-accent-green">
            {appointment.patient?.name || appointment.patientName || 'Paciente não encontrado'}
          </h4>
          <p className="text-sm text-gray-500 dark:text-dark-text-muted transition-colors duration-300">
            {formatAppointmentDate(appointment.date)}
          </p>
          <div className="flex mt-1 space-x-2">
            <Badge variant="outline" className={`${statusClass} magnetic-hover transition-all duration-300 hover:scale-105`}>
              {statusLabel}
            </Badge>
            <Badge variant="outline" className="magnetic-hover transition-all duration-300 hover:scale-105">
              {typeLabel}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="mt-2 sm:mt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="magnetic-hover ripple-effect soft-pulse">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="backdrop-blur-md bg-white/95 dark:bg-dark-bg-overlay/95 border border-gray-200 dark:border-dark-border-primary shadow-xl animate-in slide-in-from-top-2 duration-300">
            <DropdownMenuItem 
              onClick={() => onEdit(appointment)}
              className="side-expand magnetic-hover transition-all duration-300 hover:text-nutri-blue dark:hover:text-nutri-blue cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(appointment.id)}
              className="text-red-600 focus:text-red-600 side-expand magnetic-hover transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
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
