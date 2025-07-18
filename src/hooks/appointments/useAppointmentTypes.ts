
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentType } from '@/types/appointments';

/**
 * Hook to fetch and provide appointment types with dynamic fallback
 */
export const useAppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAppointmentTypes();
  }, []);

  const fetchAppointmentTypes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from database first
      const { data: dbTypes, error: dbError } = await supabase
        .from('appointment_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (dbError) {
        console.warn('Database appointment types not available, using defaults:', dbError.message);
      }

      // Use database types if available, otherwise use defaults
      let types: AppointmentType[] = [];
      
      if (dbTypes && dbTypes.length > 0) {
        types = dbTypes;
      } else {
        // Fallback to hardcoded default types with complete AppointmentType structure
        const now = new Date().toISOString();
        types = [
          { 
            id: 'initial', 
            name: 'Consulta Inicial', 
            duration_minutes: 60, 
            description: 'Primeira consulta com o paciente', 
            color: '#4B83F0',
            is_active: true,
            created_at: now,
            updated_at: now
          },
          { 
            id: 'followup', 
            name: 'Retorno', 
            duration_minutes: 45, 
            description: 'Consulta de acompanhamento', 
            color: '#4CAF50',
            is_active: true,
            created_at: now,
            updated_at: now
          },
          { 
            id: 'evaluation', 
            name: 'Avaliação', 
            duration_minutes: 50, 
            description: 'Consulta de avaliação nutricional', 
            color: '#FF9800',
            is_active: true,
            created_at: now,
            updated_at: now
          },
          { 
            id: 'nutritional_assessment', 
            name: 'Avaliação Nutricional', 
            duration_minutes: 60, 
            description: 'Avaliação nutricional completa', 
            color: '#9C27B0',
            is_active: true,
            created_at: now,
            updated_at: now
          },
          { 
            id: 'meal_planning', 
            name: 'Planejamento Alimentar', 
            duration_minutes: 45, 
            description: 'Consulta para planejamento de refeições', 
            color: '#E91E63',
            is_active: true,
            created_at: now,
            updated_at: now
          },
          { 
            id: 'consultation', 
            name: 'Consulta Geral', 
            duration_minutes: 30, 
            description: 'Consulta geral', 
            color: '#607D8B',
            is_active: true,
            created_at: now,
            updated_at: now
          }
        ];
      }
      
      setAppointmentTypes(types);
    } catch (err) {
      console.error('Error fetching appointment types:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch appointment types'));
      
      // Use minimal default types on error
      const now = new Date().toISOString();
      const defaultTypes: AppointmentType[] = [
        { 
          id: 'initial', 
          name: 'Consulta Inicial', 
          duration_minutes: 60, 
          description: 'Primeira consulta', 
          color: '#4B83F0',
          is_active: true,
          created_at: now,
          updated_at: now
        },
        { 
          id: 'followup', 
          name: 'Retorno', 
          duration_minutes: 45, 
          description: 'Consulta de retorno', 
          color: '#4CAF50',
          is_active: true,
          created_at: now,
          updated_at: now
        },
        { 
          id: 'evaluation', 
          name: 'Avaliação', 
          duration_minutes: 50, 
          description: 'Avaliação nutricional', 
          color: '#FF9800',
          is_active: true,
          created_at: now,
          updated_at: now
        },
      ];
      setAppointmentTypes(defaultTypes);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get type by ID
  const getTypeById = (id: string): AppointmentType | undefined => {
    return appointmentTypes.find(type => type.id === id);
  };

  // Helper function to get type name by ID
  const getTypeNameById = (id: string): string => {
    const type = getTypeById(id);
    return type?.name || 'Consulta';
  };

  // Helper function to create type mapping for forms
  const getTypeMapping = (): Record<string, string> => {
    const mapping: Record<string, string> = {};
    appointmentTypes.forEach(type => {
      mapping[type.id] = type.name;
    });
    return mapping;
  };

  return {
    types: appointmentTypes,
    loading,
    error,
    getTypeById,
    getTypeNameById,
    getTypeMapping,
    refetch: fetchAppointmentTypes
  };
};
