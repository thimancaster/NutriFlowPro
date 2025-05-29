
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveCalculationResults } from '@/services/calculationService';

interface CalculationData {
  patientId: string;
  userId: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
  bmr: number;
  tdee: number;
  protein: number;
  carbs: number;
  fats: number;
}

export const useCalculationSaver = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveCalculation = async (data: CalculationData): Promise<boolean> => {
    setIsSaving(true);
    
    try {
      const result = await saveCalculationResults({
        ...data,
        tipo: 'primeira_consulta',
        status: 'completo'
      });

      if (result.success) {
        toast({
          title: 'Cálculo Salvo',
          description: 'Os resultados foram salvos com sucesso.',
        });
        return true;
      } else {
        throw new Error(result.error || 'Erro ao salvar cálculo');
      }
    } catch (error: any) {
      console.error('Erro ao salvar cálculo:', error);
      toast({
        title: 'Erro ao Salvar',
        description: error.message || 'Não foi possível salvar o cálculo.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveCalculation,
    isSaving
  };
};
