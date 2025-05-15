
import { useState, useEffect } from 'react';
import { AppointmentType } from '@/types';

// This hook provides a list of appointment types
export const useAppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real application, you might fetch this from an API
    // but for now we'll use hardcoded values
    const fetchTypes = async () => {
      setIsLoading(true);
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Default types
        const defaultTypes: AppointmentType[] = [
          { id: 'initial', name: 'Avaliação Inicial', duration_minutes: 60, description: 'Primeira consulta com o paciente' },
          { id: 'followup', name: 'Acompanhamento', duration_minutes: 45, description: 'Consulta de rotina para acompanhamento' },
          { id: 'reevaluation', name: 'Reavaliação', duration_minutes: 50, description: 'Consulta para reavaliar progresso' },
          { id: 'other', name: 'Outro', duration_minutes: 30, description: 'Outro tipo de consulta' },
        ];
        
        setAppointmentTypes(defaultTypes);
      } catch (error) {
        console.error('Error fetching appointment types:', error);
        setAppointmentTypes([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTypes();
  }, []);
  
  // Return the appointmentTypes directly in the object
  return { types: appointmentTypes, isLoading };
};
