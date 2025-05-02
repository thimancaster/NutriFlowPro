
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useConsultation } from '@/contexts/ConsultationContext';
import { BackButton } from '@/components/ui/back-button';
import PatientHeader from '@/components/Anthropometry/PatientHeader';
import { useMealPlanState } from '@/hooks/useMealPlanState';
import NutritionSummary from '@/components/MealPlan/NutritionSummary';
import BreadcrumbNav from '@/components/MealPlan/BreadcrumbNav';
import MealPlanHeader from '@/components/MealPlan/MealPlanHeader';
import MealCard from '@/components/MealPlan/MealCard';
import MealPlanGeneratorUI from '@/components/MealPlan/MealPlanGeneratorUI';
import { ConsultationData as AppConsultationData, Patient as AppPatient, MealPlan as AppMealPlan } from '@/types';

const MealPlanGenerator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    activePatient, 
    consultationData, 
    mealPlan, 
    setMealPlan, 
    saveMealPlan, 
    saveConsultation 
  } = useConsultation();
  
  // Ensure we have the data
  useEffect(() => {
    if (!consultationData) {
      toast({
        title: "Dados insuficientes",
        description: "Por favor, complete uma consulta ou cálculo nutricional primeiro.",
        variant: "destructive",
      });
      navigate('/consultation');
    }
  }, [consultationData, navigate, toast]);

  const {
    mealDistribution,
    totalMealPercent,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan
  } = useMealPlanState({
    activePatient: activePatient as AppPatient,
    consultationData: consultationData as AppConsultationData,
    mealPlan: mealPlan as AppMealPlan,
    setMealPlan,
    saveConsultation,
    saveMealPlan
  });

  if (!consultationData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Carregando dados da consulta...</h2>
            <p className="text-gray-600">Aguarde enquanto processamos os dados.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <MealPlanGeneratorUI
        activePatient={activePatient}
        consultationData={consultationData}
        mealDistribution={mealDistribution}
        totalMealPercent={totalMealPercent}
        isSaving={isSaving}
        handleMealPercentChange={handleMealPercentChange}
        handleSaveMealPlan={handleSaveMealPlan}
      />
    </div>
  );
};

export default MealPlanGenerator;
