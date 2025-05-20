
import { format, parseISO, isValid, compareDesc } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';

/**
 * Formats a date string into a localized date format (e.g. "01 de janeiro de 2025")
 */
export const formatAppointmentDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Data não definida';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Data inválida';
    
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Data inválida";
  }
};

/**
 * Formats a date string into a time format (e.g. "14:30")
 */
export const formatAppointmentTime = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    
    return format(date, "HH:mm", { locale: ptBR });
  } catch (e) {
    console.error("Error formatting time:", e);
    return "";
  }
};

/**
 * Filters appointments by a selected date (matching day, month, year)
 */
export const filterAppointmentsByDate = (appointment: Appointment, selectedDate: Date | null): boolean => {
  if (!selectedDate || !appointment.date) return true;
  
  try {
    const appointmentDate = parseISO(appointment.date);
    if (!isValid(appointmentDate)) return true;
    
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

/**
 * Sorts appointments by date in descending order (newest first)
 */
export const sortAppointmentsByDate = (a: Appointment, b: Appointment): number => {
  try {
    if (!a.date || !b.date) return 0;
    
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    
    if (!isValid(dateA) || !isValid(dateB)) return 0;
    
    return compareDesc(dateA, dateB);
  } catch (e) {
    console.error("Error sorting appointments:", e);
    return 0;
  }
};

/**
 * Format a date for display in the appointment item time badge
 */
export const formatTimeBadge = (dateString: string | undefined): string => {
  if (!dateString) return '--:--';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '--:--';
    
    return format(date, "HH:mm", { locale: ptBR });
  } catch (e) {
    console.error("Error formatting time badge:", e);
    return "--:--";
  }
};
