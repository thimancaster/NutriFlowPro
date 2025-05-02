
import React from 'react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import PatientHeader from '@/components/Anthropometry/PatientHeader';
import NutritionSummary from '@/components/MealPlan/NutritionSummary';
import BreadcrumbNav from '@/components/MealPlan/BreadcrumbNav';
import MealPlanHeader from '@/components/MealPlan/MealPlanHeader';
import MealPlanForm from '@/components/MealPlan/MealPlanForm';
import { MealDistributionItem, ConsultationData } from '@/types';

interface MealPlanGeneratorUIProps {
  activePatient: { name: string; gender: string | null } | null;
  consultationData: ConsultationData;
  mealDistribution: Record<string, MealDistributionItem> | undefined;
  totalMealPercent: number;
  isSaving: boolean;
  handleMealPercentChange: (mealKey: string, newValue: number[]) => void;
  handleSaveMealPlan: () => Promise<void>;
}

const MealPlanGeneratorUI = ({
  activePatient,
  consultationData,
  mealDistribution,
  totalMealPercent,
  isSaving,
  handleMealPercentChange,
  handleSaveMealPlan
}: MealPlanGeneratorUIProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav />
      
      <MealPlanHeader onSave={handleSaveMealPlan} />
      
      {activePatient && (
        <PatientHeader 
          patientName={activePatient.name}
          patientAge={consultationData.age ? parseInt(consultationData.age) : undefined}
          patientGender={activePatient.gender}
          patientObjective={consultationData.objective}
        />
      )}
      
      <NutritionSummary consultationData={consultationData} />
      
      <MealPlanForm 
        mealDistribution={mealDistribution} 
        totalMealPercent={totalMealPercent}
        onMealPercentChange={handleMealPercentChange}
      />
      
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
  );
};

export default MealPlanGeneratorUI;
