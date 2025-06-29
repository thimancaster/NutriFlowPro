
import { z } from 'zod';
import { AppointmentStatus } from '@/types/appointment';

// Validation schema for appointments
export const appointmentValidationSchema = z.object({
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  appointment_type_id: z.string().min(1, 'Tipo de consulta é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled']),
  title: z.string().optional(),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
});

export type AppointmentValidationData = z.infer<typeof appointmentValidationSchema>;

export const useAppointmentValidation = () => {
  const validateAppointment = (data: any) => {
    try {
      return appointmentValidationSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.reduce((acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {} as Record<string, string>);
        throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
      }
      throw error;
    }
  };

  const validateStatus = (status: string): AppointmentStatus => {
    const validStatuses: AppointmentStatus[] = ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'];
    if (validStatuses.includes(status as AppointmentStatus)) {
      return status as AppointmentStatus;
    }
    return 'scheduled';
  };

  const validateDateTime = (date: string, time?: string): boolean => {
    try {
      const appointmentDate = new Date(time || date);
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(appointmentDate.getTime())) {
        return false;
      }
      
      // Check if date is not in the past (allow same day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      appointmentDate.setHours(0, 0, 0, 0);
      
      return appointmentDate >= today;
    } catch {
      return false;
    }
  };

  return {
    validateAppointment,
    validateStatus,
    validateDateTime,
    schema: appointmentValidationSchema
  };
};
