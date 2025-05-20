
import { useState, useEffect } from 'react';
import { AppointmentType } from '@/types';

/**
 * Hook to fetch and manage appointment types
 * @returns Object containing appointment types and loading state
 */
export const useAppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchTypes = async () => {
      setIsLoading(true);
      try {
        // Simulating API call - in a real application, this would fetch from your backend
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Default types with improved descriptions and durations
        const defaultTypes: AppointmentType[] = [
          { 
            id: 'initial',
            name: 'Avaliação Inicial',
            duration_minutes: 60, 
            description: 'Primeira consulta para avaliação completa do paciente',
            color: '#4B83F0'
          },
          { 
            id: 'followup',
            name: 'Acompanhamento',
            duration_minutes: 45,
            description: 'Consulta de rotina para acompanhamento do progresso',
            color: '#4CAF50'
          },
          { 
            id: 'reevaluation',
            name: 'Reavaliação',
            duration_minutes: 50,
            description: 'Consulta para reavaliar objetivos e ajustar o plano',
            color: '#FF9800'
          },
          { 
            id: 'other',
            name: 'Outro',
            duration_minutes: 30,
            description: 'Outro tipo de consulta ou atendimento',
            color: '#9C27B0'
          },
        ];
        
        setAppointmentTypes(defaultTypes);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointment types:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch appointment types'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTypes();
  }, []);
  
  /**
   * Get a specific appointment type by ID
   */
  const getAppointmentTypeById = (id: string | undefined): AppointmentType | undefined => {
    if (!id) return undefined;
    return appointmentTypes.find(type => type.id === id);
  };
  
  /**
   * Get type information by ID
   */
  const getTypeInfo = (typeId: string | undefined): {name: string, color: string} => {
    const type = getAppointmentTypeById(typeId);
    return {
      name: type?.name || 'Outro',
      color: type?.color || '#9C27B0'
    };
  };
  
  return { 
    types: appointmentTypes,
    isLoading,
    error,
    getAppointmentTypeById,
    getTypeInfo
  };
};
