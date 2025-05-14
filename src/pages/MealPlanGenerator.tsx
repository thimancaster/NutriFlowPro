
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import UserInfoHeader from '@/components/UserInfoHeader';
import MealPlanGeneratorUI from '@/components/MealPlan/MealPlanGeneratorUI';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useMealPlanState } from '@/hooks/useMealPlanState';
import { usePatient } from '@/contexts/PatientContext';
import { MealDistributionItem } from '@/types';

const MealPlanGenerator = () => {
  const { consultationData } = useConsultationData();
  const { activePatient } = usePatient();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for storing meal distribution
  const [mealDistribution, setMealDistribution] = useState<Record<string, MealDistributionItem>>({});
  const [totalPercent, setTotalPercent] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Initialize meal distribution with defaults
  useEffect(() => {
    if (!consultationData) return;
    
    const initialDistribution: Record<string, MealDistributionItem> = {
      'cafe-da-manha': {
        name: 'Café da Manhã',
        percent: 20,
        foods: []
      },
      'lanche-manha': {
        name: 'Lanche da Manhã',
        percent: 10,
        foods: []
      },
      'almoco': {
        name: 'Almoço',
        percent: 30,
        foods: []
      },
      'lanche-tarde': {
        name: 'Lanche da Tarde',
        percent: 10,
        foods: []
      },
      'jantar': {
        name: 'Jantar',
        percent: 25,
        foods: []
      },
      'ceia': {
        name: 'Ceia',
        percent: 5,
        foods: []
      }
    };
    
    setMealDistribution(initialDistribution);
    updateTotalPercent(initialDistribution);
  }, [consultationData]);

  // Calculate total percentage
  const updateTotalPercent = (distribution: Record<string, MealDistributionItem>) => {
    const total = Object.values(distribution).reduce(
      (acc, meal) => acc + meal.percent, 0
    );
    setTotalPercent(total);
  };

  // Handle meal percentage change
  const handleMealPercentChange = (mealKey: string, newValue: number | number[]) => {
    // Handle both single number and array input (from some UI components)
    const valueToUse = Array.isArray(newValue) ? newValue[0] : newValue;
    
    const updatedDistribution = {
      ...mealDistribution,
      [mealKey]: {
        ...mealDistribution[mealKey],
        percent: valueToUse
      }
    };
    
    setMealDistribution(updatedDistribution);
    updateTotalPercent(updatedDistribution);
  };

  // Add a new meal
  const handleAddMeal = () => {
    const mealKey = `refeicao-${Object.keys(mealDistribution).length + 1}`;
    const updatedDistribution = {
      ...mealDistribution,
      [mealKey]: {
        name: `Refeição ${Object.keys(mealDistribution).length + 1}`,
        percent: 0,
        foods: []
      }
    };
    
    setMealDistribution(updatedDistribution);
    updateTotalPercent(updatedDistribution);
  };

  // Remove a meal
  const handleRemoveMeal = (mealKey: string) => {
    const { [mealKey]: removed, ...rest } = mealDistribution;
    setMealDistribution(rest);
    updateTotalPercent(rest);
  };

  // Change meal name
  const handleChangeMealName = (mealKey: string, newName: string) => {
    const updatedDistribution = {
      ...mealDistribution,
      [mealKey]: {
        ...mealDistribution[mealKey],
        name: newName
      }
    };
    
    setMealDistribution(updatedDistribution);
  };

  // Save meal plan
  const handleSaveMealPlan = async () => {
    if (!consultationData) {
      toast({
        title: "Dados ausentes",
        description: "Não há dados de consulta disponíveis para gerar o plano alimentar.",
        variant: "destructive"
      });
      return;
    }

    if (totalPercent !== 100) {
      toast({
        title: "Distribuição incorreta",
        description: "A distribuição total das refeições deve ser exatamente 100%.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Here we would save the meal plan to the database
      // For now just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Plano Alimentar Gerado",
        description: "O plano alimentar foi gerado com sucesso.",
      });
      
      // Navigate to the meal plan view
      navigate('/meal-plans');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Erro ao gerar plano",
        description: "Ocorreu um erro ao gerar o plano alimentar.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!consultationData || !activePatient) {
    return (
      <>
        <Navbar />
        <UserInfoHeader />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">
                Não há dados de consulta disponíveis. Por favor, use a calculadora para gerar resultados primeiro.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <UserInfoHeader />
      <div className="container mx-auto px-4 py-8">
        <MealPlanGeneratorUI
          activePatient={activePatient}
          consultationData={consultationData}
          mealDistribution={mealDistribution}
          totalMealPercent={totalPercent}
          isSaving={isSaving}
          handleMealPercentChange={handleMealPercentChange}
          handleSaveMealPlan={handleSaveMealPlan}
          handleAddMeal={handleAddMeal}
          handleRemoveMeal={handleRemoveMeal}
          handleChangeMealName={handleChangeMealName}
        />
      </div>
    </>
  );
};

export default MealPlanGenerator;
