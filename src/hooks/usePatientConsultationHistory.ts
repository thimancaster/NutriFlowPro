
import { useState, useEffect } from 'react';
import { consultationHistoryService, ConsultationHistoryData } from '@/services/consultationHistoryService';
import { useToast } from '@/hooks/use-toast';

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

  const fetchData = async () => {
    if (!patientId) {
      setHistory([]);
      setLastConsultation(null);
      setConsultationType('primeira_consulta');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Buscar histórico completo
      const historyData = await consultationHistoryService.getPatientHistory(patientId);
      setHistory(historyData);

      // Buscar última consulta
      const lastData = await consultationHistoryService.getLastConsultation(patientId);
      setLastConsultation(lastData);

      // Determinar tipo de consulta
      const type = await consultationHistoryService.getConsultationType(patientId);
      setConsultationType(type);

      console.log(`Paciente ${patientId}: ${type} - ${historyData.length} consultas anteriores`);
      
    } catch (err: any) {
      const errorMessage = 'Erro ao carregar histórico de consultas';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      console.error('Error fetching consultation history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  return {
    history,
    lastConsultation,
    consultationType,
    isLoading,
    error,
    refetch: fetchData
  };
};
