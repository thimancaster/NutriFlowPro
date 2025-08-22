
import { AppointmentStatus } from '@/types/appointment';

export const getStatusLabel = (status: AppointmentStatus): string => {
  const statusLabels: Record<AppointmentStatus, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Faltou',
    rescheduled: 'Reagendado'
  };
  
  return statusLabels[status] || status;
};

export const getStatusColor = (status: AppointmentStatus): string => {
  const statusColors: Record<AppointmentStatus, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
    rescheduled: 'bg-yellow-100 text-yellow-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const isValidStatus = (status: string): status is AppointmentStatus => {
  return ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'].includes(status);
};
