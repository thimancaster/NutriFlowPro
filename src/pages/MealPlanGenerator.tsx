import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { useConsultation } from '@/contexts/ConsultationContext';
import { useMealPlanState } from '@/hooks/useMealPlanState';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import MealPlanGeneratorUI from '@/components/MealPlan/MealPlanGeneratorUI';
import MealAssembly from '@/components/MealPlan/MealAssembly';
import { ConsultationData as AppConsultationData, Patient as AppPatient, MealPlan as AppMealPlan, MealDistributionItem } from '@/types';

const MealPlanGenerator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1 for meal distribution, 2 for meal assembly
  
  const { 
    activePatient, 
    consultationData, 
    setConsultationData,
    mealPlan, 
    setMealPlan, 
    saveMealPlan, 
    saveConsultation 
  } = useConsultation();
  
  // Check if there's data in the location state (from calculator)
  useEffect(() => {
    if (location.state?.consultation) {
      if (!consultationData) {
        // Only set if we don't already have data in the context
        setConsultationData(location.state.consultation);
      }
    }
  }, [location.state, consultationData, setConsultationData]);
  
  // Ensure we have the data
  useEffect(() => {
    if (!consultationData && !location.state?.consultation) {
      toast({
        title: "Dados insuficientes",
        description: "Por favor, complete uma consulta ou cálculo nutricional primeiro.",
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
    handleSaveMealPlan
  } = useMealPlanState({
    activePatient: activePatient || (location.state?.patient as AppPatient),
    consultationData: consultationData || (location.state?.consultation as AppConsultationData),
    mealPlan: mealPlan as AppMealPlan,
    setMealPlan,
    saveConsultation,
    saveMealPlan
  });

  // Create a record from array to match the expected type
  const mealDistributionRecord = mealDistribution ? 
    mealDistribution.reduce((acc, meal) => {
      acc[meal.id] = meal;
      return acc;
    }, {} as Record<string, MealDistributionItem>) : {};

  // Adapter function to convert between array and record approaches
  const handleMealPercentChangeAdapter = (mealKey: string, newValue: number[]) => {
    // Just use the first value in the array since our actual implementation uses a single number
    handleMealPercentChange(mealKey, newValue[0]);
  };

  // If we don't have consultation data but have it in location state, use it
  const displayConsultationData = consultationData || location.state?.consultation;
  const displayPatient = activePatient || location.state?.patient;

  if (!displayConsultationData) {
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
  
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate(-1); // Go back to previous page instead of hardcoding /consultation
    }
  };
  
  const handleNext = async () => {
    if (step === 1) {
      if (totalMealPercent === 100) {
        setStep(2);
      } else {
        toast({
          title: "Distribuição inválida",
          description: "A distribuição total das refeições deve ser 100%.",
          variant: "destructive",
        });
      }
    } else {
      await handleSaveMealPlan();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <ConsultationWizard 
          currentStep={2}
          onBack={handleBack}
          onNext={handleNext}
          canGoNext={step === 1 ? totalMealPercent === 100 : true}
          nextButtonLabel={step === 1 ? "Continuar para Montagem" : "Salvar e Finalizar Plano"}
          canGoBack={true}
        >
          {step === 1 && displayPatient && displayConsultationData && (
            <MealPlanGeneratorUI
              activePatient={{
                name: displayPatient.name || '',
                gender: displayPatient.gender || ''
              }}
              consultationData={displayConsultationData as AppConsultationData}
              mealDistribution={mealDistributionRecord}
              totalMealPercent={totalMealPercent}
              isSaving={isSaving}
              handleMealPercentChange={handleMealPercentChangeAdapter}
              handleSaveMealPlan={handleSaveMealPlan}
            />
          )}
          
          {step === 2 && displayConsultationData && (
            <MealAssembly
              totalCalories={displayConsultationData.results.get}
              macros={{
                protein: Math.round((displayConsultationData.results.get * 0.20) / 4),
                carbs: Math.round((displayConsultationData.results.get * 0.50) / 4),
                fat: Math.round((displayConsultationData.results.get * 0.30) / 9)
              }}
              patientName={displayPatient?.name || "Paciente"}
              patientData={{
                age: displayConsultationData.age,
                weight: displayConsultationData.weight,
                height: displayConsultationData.height,
                gender: displayPatient?.gender || "não informado",
                objective: displayConsultationData.objective
              }}
            />
          )}
        </ConsultationWizard>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
