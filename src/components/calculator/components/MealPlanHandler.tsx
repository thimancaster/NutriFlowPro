
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';

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

  const handleGenerateMealPlan = () => {
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
    
    // Save calculation first, then navigate
    onSaveCalculation().then(() => {
      // Navigate to meal plan with calculation data
      navigate(`/meal-plans?patientId=${patientData.id}&createPlan=true`, {
        state: {
          calculationData: {
            bmr: tmbValue,
            tdee: teeObject.vet,
            protein: macros.protein.grams,
            carbs: macros.carbs.grams,
            fat: macros.fat.grams,
            objective: objective
          }
        }
      });
    });
  };

  return { handleGenerateMealPlan };
};
