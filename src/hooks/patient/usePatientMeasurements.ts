
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { getPatientAnthropometryHistory } from '@/services/anthropometryService';
import { useToast } from '@/hooks/use-toast';

export interface PatientMeasurement {
  id: string;
  date: string;
  weight: number;
  height: number;
  imc: number;
  tmb: number;
  get: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  notes: string;
  tipo: 'primeira_consulta' | 'retorno';
  status: 'completo' | 'em_andamento';
}

export const usePatientMeasurements = (patientId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [measurements, setMeasurements] = useState<PatientMeasurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!patientId || !user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await getPatientAnthropometryHistory(user.id, patientId);
        
        if (result.success && result.data) {
          // Transform anthropometry data to measurement format
          const transformedMeasurements: PatientMeasurement[] = result.data.map((item, index) => {
            // Calculate TMB using Harris-Benedict formula (simplified)
            const imc = item.imc || (item.weight && item.height ? item.weight / Math.pow(item.height / 100, 2) : 0);
            const tmb = item.weight && item.height ? 
              (66.5 + (13.75 * item.weight) + (5.003 * item.height) - (6.755 * 30)) : 0; // Assuming age 30 for now
            const get = tmb * 1.55; // Assuming moderate activity
            
            return {
              id: item.id || `measurement-${index}`,
              date: new Date(item.date).toLocaleDateString('pt-BR'),
              weight: item.weight || 0,
              height: item.height || 0,
              imc: Number(imc.toFixed(1)),
              tmb: Math.round(tmb),
              get: Math.round(get),
              macros: {
                protein: Math.round(get * 0.15 / 4), // 15% of calories from protein
                carbs: Math.round(get * 0.55 / 4), // 55% of calories from carbs
                fat: Math.round(get * 0.30 / 9) // 30% of calories from fat
              },
              notes: `Medição realizada em ${new Date(item.date).toLocaleDateString('pt-BR')}`,
              tipo: index === 0 ? 'primeira_consulta' : 'retorno',
              status: 'completo' as const
            };
          });
          
          // Sort by date (most recent first)
          transformedMeasurements.sort((a, b) => 
            new Date(b.date.split('/').reverse().join('-')).getTime() - 
            new Date(a.date.split('/').reverse().join('-')).getTime()
          );
          
          setMeasurements(transformedMeasurements);
        } else {
          setError(result.error || 'Failed to fetch measurements');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o histórico de medições",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [patientId, user?.id, toast]);

  return {
    measurements,
    loading,
    error,
    refetch: () => {
      if (patientId && user?.id) {
        setLoading(true);
      }
    }
  };
};
