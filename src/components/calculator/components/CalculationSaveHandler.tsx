
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveCalculationResults } from '@/services/calculationService';
import { Patient } from '@/types';

interface CalculationSaveHandlerProps {
  patientData?: Patient | null;
  user: any;
  weight: number | '';
  height: number | '';
  age: number | '';
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  tmbValue: number | null;
  teeObject: any;
  macros: any;
  isSaving: boolean;
  onSavingChange: (saving: boolean) => void;
}

export const useCalculationSaveHandler = ({
  patientData,
  user,
  weight,
  height,
  age,
  sex,
  activityLevel,
  objective,
  tmbValue,
  teeObject,
  macros,
  isSaving,
  onSavingChange
}: CalculationSaveHandlerProps) => {
  const { toast } = useToast();

  const handleSaveCalculation = async () => {
    if (!patientData || !teeObject || !macros) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os resultados. Certifique-se de que um paciente está selecionado e o cálculo foi realizado.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar os resultados.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      onSavingChange(true);
      
      // Convert weight, height, age to numbers with proper fallbacks
      const weightValue = typeof weight === 'number' ? weight : parseFloat(weight.toString()) || 0;
      const heightValue = typeof height === 'number' ? height : parseFloat(height.toString()) || 0;
      const ageValue = typeof age === 'number' ? age : parseInt(age.toString()) || 0;
      
      const calculationData = {
        patient_id: patientData.id,
        user_id: user.id,
        weight: weightValue,
        height: heightValue,
        age: ageValue,
        gender: sex === 'M' ? 'male' : 'female',
        activity_level: activityLevel,
        goal: objective,
        bmr: tmbValue || 0,
        tdee: teeObject.vet || 0,
        protein: macros.protein.grams || 0,
        carbs: macros.carbs.grams || 0,
        fats: macros.fat.grams || 0,
        tipo: 'primeira_consulta',
        status: 'em_andamento'
      };
      
      const result = await saveCalculationResults(calculationData);
      
      if (result.success) {
        toast({
          title: "Cálculo salvo",
          description: "Os resultados foram salvos com sucesso para o paciente.",
        });
      } else {
        throw new Error(result.error || "Erro ao salvar cálculo");
      }
    } catch (error) {
      console.error("Error saving calculation:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os resultados. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      onSavingChange(false);
    }
  };

  return { handleSaveCalculation };
};
