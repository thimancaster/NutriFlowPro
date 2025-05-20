
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';

export const formatAppointmentDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

export const formatAppointmentTime = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, "HH:mm", { locale: ptBR });
  } catch (e) {
    console.error("Error formatting time:", e);
    return "";
  }
};

export const filterAppointmentsByDate = (appointment: Appointment, selectedDate: Date | null) => {
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

export const sortAppointmentsByDate = (a: Appointment, b: Appointment) => {
  try {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateB.getTime() - dateA.getTime();
  } catch (e) {
    console.error("Error sorting appointments:", e);
    return 0;
  }
};
