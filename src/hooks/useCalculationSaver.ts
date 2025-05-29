
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveCalculationResults } from '@/services/calculationService';

interface CalculationData {
  patient_id: string;
  user_id: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  activity_level: string;
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

  const saveCalculation = async (data: {
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
  }): Promise<boolean> => {
    setIsSaving(true);
    
    try {
      const calculationData: CalculationData = {
        patient_id: data.patientId,
        user_id: data.userId,
        weight: data.weight,
        height: data.height,
        age: data.age,
        gender: data.gender,
        activity_level: data.activityLevel,
        goal: data.goal,
        bmr: data.bmr,
        tdee: data.tdee,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats
      };

      const result = await saveCalculationResults({
        ...calculationData,
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
