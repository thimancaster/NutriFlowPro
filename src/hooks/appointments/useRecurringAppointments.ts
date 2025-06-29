
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { appointmentService } from '@/services/appointmentService';
import { Appointment } from '@/types/appointment';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrenceConfig {
  pattern: RecurrencePattern;
  interval: number; // Every X days/weeks/months
  endDate?: string;
  maxOccurrences?: number;
  daysOfWeek?: number[]; // For weekly pattern
}

export const useRecurringAppointments = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const generateRecurringDates = (
    startDate: string,
    config: RecurrenceConfig
  ): string[] => {
    const dates: string[] = [];
    let currentDate = new Date(startDate);
    const endDate = config.endDate ? new Date(config.endDate) : null;
    const maxOccurrences = config.maxOccurrences || 52; // Default to 1 year of weekly appointments

    for (let i = 0; i < maxOccurrences; i++) {
      if (endDate && currentDate > endDate) break;

      dates.push(format(currentDate, 'yyyy-MM-dd'));

      // Calculate next date based on pattern
      switch (config.pattern) {
        case 'daily':
          currentDate = addDays(currentDate, config.interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, config.interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, config.interval);
          break;
        default:
          // Custom pattern - for now, default to weekly
          currentDate = addWeeks(currentDate, config.interval);
      }
    }

    return dates;
  };

  const createRecurringAppointments = async (
    appointmentData: Partial<Appointment>,
    recurrenceConfig: RecurrenceConfig
  ) => {
    if (!appointmentData.date) return;

    setIsCreating(true);
    try {
      const dates = generateRecurringDates(appointmentData.date, recurrenceConfig);
      const results = [];

      for (const date of dates) {
        const appointmentForDate = {
          ...appointmentData,
          date,
          start_time: appointmentData.start_time 
            ? appointmentData.start_time.replace(/^\d{4}-\d{2}-\d{2}/, date)
            : undefined,
          end_time: appointmentData.end_time
            ? appointmentData.end_time.replace(/^\d{4}-\d{2}-\d{2}/, date)
            : undefined,
        };

        const result = await appointmentService.createAppointment(appointmentForDate);
        results.push(result);
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      toast({
        title: 'Agendamentos Recorrentes',
        description: `${successful} agendamentos criados com sucesso${failed > 0 ? `, ${failed} falharam` : ''}`,
      });

      return results;
    } catch (error) {
      console.error('Error creating recurring appointments:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar agendamentos recorrentes',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createRecurringAppointments,
    generateRecurringDates,
    isCreating
  };
};
