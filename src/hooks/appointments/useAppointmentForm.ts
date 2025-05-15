
import { useState, useEffect } from 'react';
import { format, addMinutes, parseISO } from 'date-fns';
import { Appointment } from '@/types';

interface UseAppointmentFormProps {
  appointment: Appointment | null;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
}

export const useAppointmentForm = ({ appointment, onSubmit }: UseAppointmentFormProps) => {
  const [formData, setFormData] = useState<Partial<Appointment> & {duration_minutes?: number}>({
    patient_id: '',
    title: '',
    start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_time: format(addMinutes(new Date(), 60), "yyyy-MM-dd'T'HH:mm"),
    duration_minutes: 60,
    appointment_type_id: '',
    notes: '',
    status: 'scheduled'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with appointment data when editing
  useEffect(() => {
    if (appointment) {
      const startTime = typeof appointment.start_time === 'string'
        ? parseISO(appointment.start_time)
        : appointment.start_time;
        
      const endTime = typeof appointment.end_time === 'string'
        ? parseISO(appointment.end_time)
        : appointment.end_time;
      
      setFormData({
        ...appointment,
        start_time: format(startTime, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [appointment]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // If changing start_time, update end_time based on duration
      if (name === 'start_time') {
        const startDate = new Date(value);
        const endDate = addMinutes(startDate, prev.duration_minutes || 60);
        return { 
          ...prev, 
          [name]: value,
          end_time: format(endDate, "yyyy-MM-dd'T'HH:mm")
        };
      }
      
      // For other fields, just update the value
      return { ...prev, [name]: value };
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    // Special handling for appointment type selection
    if (name === 'appointment_type_id' && value) {
      handleAppointmentTypeChange(name, value);
    } else {
      handleChange({ target: { name, value } } as React.ChangeEvent<HTMLSelectElement>);
    }
  };
  
  const handleAppointmentTypeChange = (name: string, value: string) => {
    setFormData(prev => {
      // Get the appointment type duration (would be passed from parent)
      const appointmentType = window.appointmentTypes?.find(type => type.id === value);
      
      if (appointmentType) {
        const startDate = prev.start_time ? new Date(prev.start_time as string) : new Date();
        const endDate = addMinutes(startDate, appointmentType.duration_minutes);
        
        return { 
          ...prev, 
          [name]: value,
          duration_minutes: appointmentType.duration_minutes,
          end_time: format(endDate, "yyyy-MM-dd'T'HH:mm")
        };
      }
      
      return { ...prev, [name]: value };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Remove duration_minutes before submitting as it's not in the Appointment type
      const { duration_minutes, ...submissionData } = formData;
      await onSubmit(submissionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleSubmit
  };
};
