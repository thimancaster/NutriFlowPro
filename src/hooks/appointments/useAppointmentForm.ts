
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Appointment, AppointmentStatus } from '@/types';
import { format, isValid, parseISO } from 'date-fns';
import { useAppointmentTypes } from './useAppointmentTypes';

// Create schema for appointment
const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  start_time: z.string().min(1, 'Date and time are required'),
  appointment_type_id: z.string().min(1, 'Appointment type is required'),
  status: z.string().min(1, 'Status is required'),
  title: z.string().optional(),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
  end_time: z.string().optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface UseAppointmentFormProps {
  appointment: Appointment | null;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
}

export const useAppointmentForm = ({ appointment, onSubmit }: UseAppointmentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Appointment>>({
    patient_id: '',
    start_time: '',
    appointment_type_id: 'initial',
    status: 'scheduled' as AppointmentStatus,
    title: '',
    notes: '',
    recommendations: '',
  });
  
  // Use dynamic appointment types
  const { types: appointmentTypes, getTypeNameById, getTypeMapping } = useAppointmentTypes();
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: '',
      start_time: '',
      appointment_type_id: 'initial',
      status: 'scheduled',
      title: '',
      notes: '',
      recommendations: '',
      end_time: '',
    },
  });
  
  // Set form values when appointment changes
  useEffect(() => {
    if (appointment) {
      // Format date for the form
      let formattedDate = '';
      try {
        // Try to parse the date string
        const parsedDate = parseISO(appointment.date || appointment.start_time || '');
        if (isValid(parsedDate)) {
          formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm");
          setDefaultDate(parsedDate);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
      
      const updatedFormData: Partial<Appointment> = {
        patient_id: appointment.patient_id || '',
        start_time: formattedDate,
        appointment_type_id: appointment.appointment_type_id || appointment.type || 'initial',
        status: appointment.status || 'scheduled' as AppointmentStatus,
        title: appointment.title || '',
        notes: appointment.notes || '',
        recommendations: appointment.recommendations || '',
      };
      
      setFormData(updatedFormData);
      form.reset(updatedFormData as any);
    } else {
      const emptyFormData: Partial<Appointment> = {
        patient_id: '',
        start_time: '',
        appointment_type_id: 'initial',
        status: 'scheduled' as AppointmentStatus,
        title: '',
        notes: '',
        recommendations: '',
      };
      
      setFormData(emptyFormData);
      form.reset(emptyFormData as any);
      setDefaultDate(undefined);
    }
  }, [appointment, form]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    form.setValue(name as any, value);
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Se estamos mudando o tipo de consulta, atualizar o título automaticamente
      if (name === 'appointment_type_id') {
        const typeName = getTypeNameById(value);
        newData.title = typeName;
        form.setValue('title', typeName);
      }
      
      if (name === 'status') {
        return { ...newData, [name]: value as AppointmentStatus };
      }
      return newData;
    });
    
    form.setValue(name as any, value);
  };
  
  const handleSubmitForm = async (values: AppointmentFormValues) => {
    setIsSubmitting(true);
    try {
      // Garantir que o campo type seja sempre preenchido baseado no appointment_type_id
      const typeName = getTypeNameById(values.appointment_type_id);
      
      // For Appointment status, ensure it's a valid AppointmentStatus type
      const status = values.status as AppointmentStatus;
      
      // Normalizar dados para submissão
      const submissionData = {
        ...values,
        date: values.start_time, // Map start_time to date for backend compatibility
        type: typeName, // Sempre preencher o campo type
        status,
        title: values.title || typeName, // Se não há título, usar o nome do tipo
        // Garantir que appointment_type_id seja consistente
        appointment_type_id: values.appointment_type_id,
      };
      
      console.log('Submitting appointment data:', submissionData);
      
      await onSubmit(submissionData);
      form.reset();
    } catch (error) {
      console.error('Error submitting appointment form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    formData,
    isSubmitting,
    defaultDate,
    appointmentTypes, // Expose types for components
    handleChange,
    handleSelectChange,
    handleSubmit: form.handleSubmit(handleSubmitForm),
  };
};
