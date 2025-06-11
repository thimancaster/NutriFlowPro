
import { useState, useEffect } from 'react';
import { ConsultationHistoryData, consultationHistoryService } from '@/services/consultationHistoryService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';

export interface UsePatientConsultationHistoryReturn {
  history: ConsultationHistoryData[];
  lastConsultation: ConsultationHistoryData | null;
  consultationType: 'primeira_consulta' | 'retorno';
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePatientConsultationHistory = (patientId?: string): UsePatientConsultationHistoryReturn => {
  const [history, setHistory] = useState<ConsultationHistoryData[]>([]);
  const [lastConsultation, setLastConsultation] = useState<ConsultationHistoryData | null>(null);
  const [consultationType, setConsultationType] = useState<'primeira_consulta' | 'retorno'>('primeira_consulta');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    if (!patientId || !user?.id) {
      setHistory([]);
      setLastConsultation(null);
      setConsultationType('primeira_consulta');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Buscar histórico completo com user_id
      const historyData = await consultationHistoryService.getPatientHistory(patientId, user.id);
      setHistory(historyData);

      // Buscar última consulta
      const lastData = historyData.length > 0 ? historyData[0] : null;
      setLastConsultation(lastData);

      // Determinar tipo de consulta
      const type = historyData.length === 0 ? 'primeira_consulta' : 'retorno';
      setConsultationType(type);

      console.log(`Paciente ${patientId}: ${type} - ${historyData.length} consultas anteriores`);
      
    } catch (err: any) {
      const errorMessage = 'Erro ao carregar histórico de consultas';
      setError(errorMessage);
      console.error('Error fetching consultation history:', err);
      
      // Só mostrar toast de erro se for um erro real, não se for apenas dados não encontrados
      if (err.message && !err.message.includes('not found') && !err.message.includes('PGRST116')) {
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId, user?.id]);

  return {
    history,
    lastConsultation,
    consultationType,
    isLoading,
    error,
    refetch: fetchData
  };
};
