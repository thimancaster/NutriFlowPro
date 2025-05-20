
import { AppointmentStatus } from '@/types';

/**
 * Normalizes different status strings to the standard AppointmentStatus type
 */
export const getStatusLabel = (status: string): AppointmentStatus => {
  switch (status) {
    case 'scheduled': return 'scheduled';
    case 'completed': return 'completed';
    case 'canceled': 
    case 'cancelled': return 'cancelled';
    case 'no-show': 
    case 'noshow': return 'noshow';
    case 'rescheduled': return 'rescheduled';
    default: return 'scheduled';
  }
};
