
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MealPlan as AppMealPlan } from '@/types'; 
import { BackButton } from '@/components/ui/back-button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useConsultation } from '@/contexts/ConsultationContext';
import MealPlanForm from '@/components/MealPlan/MealPlanForm';
import MealPlanAssembly from '@/components/MealPlan/MealPlanAssembly';
import { useMealPlanState } from '@/hooks/useMealPlanState';
import { useConsultationData } from '@/contexts/ConsultationDataContext';

const MealPlanGenerator = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { consultationData } = useConsultationData();
  const { mealPlan, setMealPlan, saveMealPlan } = useMealPlan();
  const [activeTab, setActiveTab] = useState('distribution');
  const { isConsultationActive, currentStep, setCurrentStep } = useConsultation();
  
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

  const {
    mealDistribution,
    totalMealPercent,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan,
    addMeal,
    removeMeal
  } = useMealPlanState({
    activePatient: consultationData?.patient || location.state?.consultation?.patient || null,
    consultationData: consultationData || location.state?.consultation || null,
    mealPlan: mealPlan as AppMealPlan,
    setMealPlan,
    saveConsultation: async () => {
      // This is a placeholder - in the real app you'd save consultation data
      return Promise.resolve();
    },
    saveMealPlan
  });

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
              totalPercent={totalMealPercent}
              onMealPercentChange={handleMealPercentChange}
              onSave={handleSaveMealPlan}
              isSaving={isSaving}
              onAddMeal={addMeal}
              onRemoveMeal={removeMeal}
              consultationData={consultationData || location.state?.consultation || null}
            />
          </TabsContent>
          
          <TabsContent value="assembly">
            <MealPlanAssembly />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
