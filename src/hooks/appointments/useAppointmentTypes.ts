
import { useState, useEffect } from 'react';
import { AppointmentType } from '@/types';

/**
 * Hook to fetch and provide appointment types
 */
export const useAppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointmentTypes();
  }, []);

  const fetchAppointmentTypes = async () => {
    setLoading(true);
    try {
      // Since we don't have an actual appointment_types table
      // Use hardcoded default types instead
      const defaultTypes: AppointmentType[] = [
        { id: 'initial', name: 'Avaliação Inicial', duration_minutes: 60, description: 'Primeira consulta com o paciente', color: '#4B83F0' },
        { id: 'followup', name: 'Acompanhamento', duration_minutes: 45, description: 'Consulta de rotina para acompanhamento', color: '#4CAF50' },
        { id: 'reevaluation', name: 'Reavaliação', duration_minutes: 50, description: 'Consulta para reavaliar progresso', color: '#FF9800' },
        { id: 'other', name: 'Outro', duration_minutes: 30, description: 'Outro tipo de consulta', color: '#9C27B0' },
      ];
      
      setAppointmentTypes(defaultTypes);
    } finally {
      setLoading(false);
    }
  };

  return {
    types: appointmentTypes,
    loading,
    fetchAppointmentTypes
  };
};
