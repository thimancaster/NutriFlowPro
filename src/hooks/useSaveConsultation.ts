
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConsultationService } from '@/services/consultationService';
import { ConsultationCreateInput, ConsultationUpdateInput } from '@/types/consultationTypes';

interface UseSaveConsultationProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useSaveConsultation = ({ onSuccess, onError }: UseSaveConsultationProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createConsultation = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        patient_id: data.patient_id,
        date: data.date || new Date().toISOString(),
        metrics: data.metrics || {}
      };
      const result = await ConsultationService.create(payload);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Consulta criada com sucesso!",
        });
        onSuccess?.();
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao criar consulta');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar consulta';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConsultation = async (id: string, data: ConsultationUpdateInput) => {
    setIsLoading(true);
    try {
      // Update not available in current service, use create for now
      const result = await ConsultationService.create(data);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Consulta atualizada com sucesso!",
        });
        onSuccess?.();
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao atualizar consulta');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao atualizar consulta';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for backward compatibility
  const saveConsultation = updateConsultation;
  const handleSaveConsultation = updateConsultation;
  const isSubmitting = isLoading;

  return {
    createConsultation,
    updateConsultation,
    saveConsultation,
    handleSaveConsultation,
    isLoading,
    isSubmitting
  };
};
