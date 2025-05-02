
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useConsultation } from '@/contexts/ConsultationContext';
import { BackButton } from '@/components/ui/back-button';
import PatientHeader from '@/components/Anthropometry/PatientHeader';
import ConsultationHeader from '@/components/ConsultationHeader';
import { useMealPlanState } from '@/hooks/useMealPlanState';
import NutritionSummary from '@/components/MealPlan/NutritionSummary';
import BreadcrumbNav from '@/components/MealPlan/BreadcrumbNav';
import MealPlanHeader from '@/components/MealPlan/MealPlanHeader';
import MealCard from '@/components/MealPlan/MealCard';

const MealPlanGenerator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { activePatient, consultationData, mealPlan, setMealPlan, saveMealPlan, saveConsultation } = useConsultation();
  
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
    activePatient,
    consultationData,
    mealPlan,
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
      <div className="container mx-auto px-4 py-8">
        <ConsultationHeader currentStep="meal-plan" />
        
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav />
        
        {/* Header */}
        <MealPlanHeader onSave={handleSaveMealPlan} />
        
        {activePatient && (
          <PatientHeader 
            patientName={activePatient.name}
            patientAge={consultationData.age ? parseInt(consultationData.age) : undefined}
            patientGender={activePatient.gender}
            patientObjective={consultationData.objective}
          />
        )}
        
        {/* Nutrition Summary */}
        <NutritionSummary consultationData={consultationData} />
        
        <p className="text-sm mb-1">
          Distribuição total: <span className={totalMealPercent === 100 ? "text-green-600" : "text-red-600"}>
            {totalMealPercent}%
          </span>
        </p>
        
        {/* Meal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealDistribution && Object.keys(mealDistribution).map((mealKey) => (
            <MealCard
              key={mealKey}
              mealKey={mealKey}
              meal={mealDistribution[mealKey]}
              onPercentChange={handleMealPercentChange}
            />
          ))}
        </div>
        
        <div className="mt-8 flex justify-between">
          <BackButton to="/consultation" variant="outline" />
          <Button 
            onClick={handleSaveMealPlan}
            className="bg-nutri-green hover:bg-nutri-green-dark"
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar e Finalizar Plano"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
