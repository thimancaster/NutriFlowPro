
import { useState, useEffect } from 'react';
import { AppointmentType } from '@/types';

// This hook provides a list of appointment types
export const useAppointmentTypes = () => {
  const [types, setTypes] = useState<AppointmentType[]>([]);
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
          { id: 'initial', name: 'Avaliação Inicial', description: 'Primeira consulta com o paciente' },
          { id: 'followup', name: 'Acompanhamento', description: 'Consulta de rotina para acompanhamento' },
          { id: 'reevaluation', name: 'Reavaliação', description: 'Consulta para reavaliar progresso' },
          { id: 'other', name: 'Outro', description: 'Outro tipo de consulta' },
        ];
        
        setTypes(defaultTypes);
      } catch (error) {
        console.error('Error fetching appointment types:', error);
        setTypes([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTypes();
  }, []);
  
  return { types, isLoading };
};
