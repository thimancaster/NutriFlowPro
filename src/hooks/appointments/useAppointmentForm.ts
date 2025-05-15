
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Appointment } from '@/types';
import { format, isValid, parseISO } from 'date-fns';

// Create schema for appointment
const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Appointment type is required'),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface UseAppointmentFormProps {
  appointment: Appointment | null;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
}

export const useAppointmentForm = ({ appointment, onSubmit }: UseAppointmentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: '',
      date: '',
      type: 'initial',
      status: 'scheduled',
      notes: '',
      recommendations: '',
    },
  });
  
  // Set form values when appointment changes
  useEffect(() => {
    if (appointment) {
      // Format date for the form
      let formattedDate = '';
      try {
        // Try to parse the date string
        const parsedDate = parseISO(appointment.date);
        if (isValid(parsedDate)) {
          formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm");
          setDefaultDate(parsedDate);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
      
      form.reset({
        patient_id: appointment.patient_id,
        date: formattedDate,
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes,
        recommendations: appointment.recommendations,
      });
    } else {
      form.reset({
        patient_id: '',
        date: '',
        type: 'initial',
        status: 'scheduled',
        notes: '',
        recommendations: '',
      });
      setDefaultDate(undefined);
    }
  }, [appointment, form]);
  
  const handleSubmit = async (values: AppointmentFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        // Additional fields if needed
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting appointment form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    isSubmitting,
    defaultDate,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
};
