
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment } from '@/types/appointment';
import { useAppointmentValidation } from './useAppointmentValidation';

export const useAppointmentOperations = (onSuccess?: () => Promise<void>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { validateAppointment, validateStatus } = useAppointmentValidation();

  const addAppointment = async (appointmentData: Partial<Appointment>) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate and normalize data
      const validatedData = validateAppointment({
        ...appointmentData,
        status: validateStatus(appointmentData.status || 'scheduled'),
        user_id: user.id
      });

      const result = await appointmentService.createAppointment({
        ...validatedData,
        user_id: user.id
      });

      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar agendamento');
      }

      toast({
        title: 'Sucesso',
        description: 'Agendamento criado com sucesso!',
      });

      if (onSuccess) {
        await onSuccess();
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(new Error(errorMessage));
      
      toast({
        title: 'Erro',
        description: `Não foi possível criar o agendamento: ${errorMessage}`,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    setLoading(true);
    setError(null);

    try {
      // Validate data if provided
      if (Object.keys(appointmentData).length > 0) {
        const validatedData = validateAppointment({
          ...appointmentData,
          status: validateStatus(appointmentData.status || 'scheduled')
        });
        appointmentData = validatedData;
      }

      const result = await appointmentService.updateAppointment(id, appointmentData);

      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar agendamento');
      }

      toast({
        title: 'Sucesso',
        description: 'Agendamento atualizado com sucesso!',
      });

      if (onSuccess) {
        await onSuccess();
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(new Error(errorMessage));
      
      toast({
        title: 'Erro',
        description: `Não foi possível atualizar o agendamento: ${errorMessage}`,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await appointmentService.deleteAppointment(id);

      if (!result.success) {
        throw new Error(result.message || 'Erro ao excluir agendamento');
      }

      toast({
        title: 'Sucesso',
        description: 'Agendamento excluído com sucesso!',
      });

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(new Error(errorMessage));
      
      toast({
        title: 'Erro',
        description: `Não foi possível excluir o agendamento: ${errorMessage}`,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment
  };
};
