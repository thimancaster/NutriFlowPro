
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface MealPlanHandlerProps {
  patientData?: Patient | null;
  user: any;
  teeObject: any;
  macros: any;
  tmbValue: number | null;
  objective: string;
  onSaveCalculation: () => Promise<void>;
}

export const useMealPlanHandler = ({
  patientData,
  user,
  teeObject,
  macros,
  tmbValue,
  objective,
  onSaveCalculation
}: MealPlanHandlerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenerateMealPlan = async () => {
    if (!patientData || !teeObject || !macros) {
      toast({
        title: "Informações incompletas",
        description: "Certifique-se de que um paciente está selecionado e o cálculo foi realizado.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para gerar um plano.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use default values since measurements were removed from Patient type
      const weight = 0;
      const height = 0;
      
      // Primeiro, salvar o cálculo no banco de dados
      const calculationData = {
        user_id: user.id,
        patient_id: patientData.id,
        bmr: tmbValue || 0,
        tdee: teeObject.vet || 0,
        protein: macros.protein.grams || 0,
        carbs: macros.carbs.grams || 0,
        fats: macros.fat.grams || 0,
        goal: objective,
        weight: weight,
        height: height,
        age: patientData.age || 0,
        gender: patientData.gender || 'other',
        activity_level: 'moderado', // valor padrão se não especificado
        tipo: 'primeira_consulta',
        status: 'completo'
      };

      const { data: savedCalculation, error: calcError } = await supabase
        .from('calculations')
        .insert(calculationData)
        .select()
        .single();

      if (calcError) {
        console.error('Erro ao salvar cálculo:', calcError);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o cálculo. Tentando continuar...",
          variant: "destructive"
        });
      }

      // Salvar no contexto para usar na geração do plano
      await onSaveCalculation();
      
      // Navigate to meal plan with calculation data
      navigate(`/meal-plans?patientId=${patientData.id}&createPlan=true`, {
        state: {
          calculationData: {
            id: savedCalculation?.id || `temp-${Date.now()}`,
            bmr: tmbValue,
            tdee: teeObject.vet,
            protein: macros.protein.grams,
            carbs: macros.carbs.grams,
            fat: macros.fat.grams,
            objective: objective,
            totalCalories: teeObject.vet,
            fats: macros.fat.grams
          },
          patientData: patientData,
          systemType: 'ENP'
        }
      });

      toast({
        title: "Dados salvos",
        description: "Cálculo salvo com sucesso. Redirecionando para o plano alimentar...",
      });

    } catch (error) {
      console.error('Erro ao processar:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return { handleGenerateMealPlan };
};
