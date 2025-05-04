
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { useConsultation } from '@/contexts/ConsultationContext';
import { useMealPlanState } from '@/hooks/useMealPlanState';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import MealPlanGeneratorUI from '@/components/MealPlan/MealPlanGeneratorUI';
import MealAssembly from '@/components/MealPlan/MealAssembly';
import { ConsultationData as AppConsultationData, Patient as AppPatient, MealPlan as AppMealPlan } from '@/types';

const MealPlanGenerator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 for meal distribution, 2 for meal assembly
  
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
  
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/consultation');
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
          {step === 1 && (
            <MealPlanGeneratorUI
              activePatient={{
                name: activePatient?.name || '',
                gender: activePatient?.gender || ''
              }}
              consultationData={consultationData as AppConsultationData}
              mealDistribution={mealDistribution}
              totalMealPercent={totalMealPercent}
              isSaving={isSaving}
              handleMealPercentChange={handleMealPercentChange}
              handleSaveMealPlan={handleSaveMealPlan}
            />
          )}
          
          {step === 2 && consultationData && (
            <MealAssembly
              totalCalories={consultationData.results.get}
              macros={{
                protein: Math.round((consultationData.results.get * 0.20) / 4),
                carbs: Math.round((consultationData.results.get * 0.50) / 4),
                fat: Math.round((consultationData.results.get * 0.30) / 9)
              }}
              patientName={activePatient?.name || "Paciente"}
              patientData={{
                age: consultationData.age,
                weight: consultationData.weight,
                height: consultationData.height,
                gender: activePatient?.gender || "não informado",
                objective: consultationData.objective
              }}
            />
          )}
        </ConsultationWizard>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
