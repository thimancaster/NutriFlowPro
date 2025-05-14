
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton } from '@/components/ui/back-button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useConsultation } from '@/contexts/ConsultationContext';
import MealPlanForm from '@/components/MealPlan/MealPlanForm';
import MealPlanAssembly from '@/components/MealPlan/MealPlanAssembly';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useMealDistribution } from '@/hooks/meal-plan/useMealDistribution';
import { MealDistributionItem } from '@/types';

const MealPlanGenerator = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { consultationData } = useConsultationData();
  const { mealPlan, setMealPlan, saveMealPlan } = useMealPlan();
  const [activeTab, setActiveTab] = useState('distribution');
  const { isConsultationActive, currentStep, setCurrentStep } = useConsultation();
  const [isSaving, setIsSaving] = useState(false);
  
  // Use useMealDistribution hook
  const {
    mealDistribution,
    totalDistributionPercentage,
    handleMealPercentChange,
    addMeal,
    removeMeal
  } = useMealDistribution([], consultationData);
  
  useEffect(() => {
    if (currentStep !== 'meal-plan') {
      setCurrentStep('meal-plan');
    }
  }, [currentStep, setCurrentStep]);
  
  // Check if we have consultationData, otherwise redirect
  useEffect(() => {
    if (!consultationData && !location.state?.consultation) {
      toast({
        title: "Consulta não encontrada",
        description: "Você precisa criar uma consulta antes de gerar um plano alimentar",
        variant: "destructive",
      });
      navigate('/consultation');
    }
  }, [consultationData, location.state, navigate, toast]);

  // Handle save meal plan
  const handleSaveMealPlan = async () => {
    const activePatientData = consultationData?.patient || location.state?.consultation?.patient;
    const consultationDataObj = consultationData || location.state?.consultation;
    
    if (!activePatientData || !consultationDataObj || !consultationDataObj.id) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para salvar o plano alimentar.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Create a simplified mealplan data object
      const mealPlanData = {
        name: `Plano para ${activePatientData.name}`,
        patient_id: activePatientData.id,
        consultation_id: consultationDataObj.id,
        calories: consultationDataObj.results?.get || 0,
        protein: consultationDataObj.results?.macros.protein || 0,
        carbs: consultationDataObj.results?.macros.carbs || 0,
        fat: consultationDataObj.results?.macros.fat || 0,
        mealDistribution: mealDistribution,
        meals: []
      };

      // Save or update the meal plan - now passing the consultation ID
      const mealPlanId = await saveMealPlan(consultationDataObj.id, mealPlanData);
      
      // Update the meal plan in context
      if (mealPlanId) {
        setMealPlan({
          ...mealPlanData, 
          id: mealPlanId,
          user_id: user?.id || '',
          date: new Date(),
          total_calories: consultationDataObj.results?.get || 0,
          total_protein: consultationDataObj.results?.macros.protein || 0,
          total_carbs: consultationDataObj.results?.macros.carbs || 0,
          total_fats: consultationDataObj.results?.macros.fat || 0
        });
      }
      
      toast({
        title: "Plano alimentar salvo",
        description: "Distribuição de refeições foi salva com sucesso.",
      });
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano alimentar.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <BackButton to="/consultation" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plano Alimentar</h1>
            <p className="text-gray-600">
              Crie um plano alimentar baseado nos resultados da consulta
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="distribution">Distribuição de Refeições</TabsTrigger>
            <TabsTrigger value="assembly">Montagem das Refeições</TabsTrigger>
          </TabsList>
          
          <TabsContent value="distribution">
            <MealPlanForm 
              mealDistribution={mealDistribution}
              totalMealPercent={totalDistributionPercentage * 100}
              onMealPercentChange={(id, value) => handleMealPercentChange(id, value as number)}
              onSave={handleSaveMealPlan}
              isSaving={isSaving}
              onAddMeal={addMeal}
              onRemoveMeal={removeMeal}
              consultationData={consultationData || location.state?.consultation || null}
            />
          </TabsContent>
          
          <TabsContent value="assembly">
            <MealPlanAssembly 
              totalCalories={consultationDataObj?.results?.get || 0}
              macros={{
                protein: consultationDataObj?.results?.macros.protein || 0,
                carbs: consultationDataObj?.results?.macros.carbs || 0, 
                fat: consultationDataObj?.results?.macros.fat || 0
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
