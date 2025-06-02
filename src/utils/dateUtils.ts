
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return typeof date === 'string' ? date : date.toLocaleDateString('pt-BR');
  }
};

export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return typeof date === 'string' ? date : date.toLocaleString('pt-BR');
  }
};

export const formatTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'HH:mm', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting time:', error);
    return typeof date === 'string' ? date : date.toLocaleTimeString('pt-BR');
  }
};
