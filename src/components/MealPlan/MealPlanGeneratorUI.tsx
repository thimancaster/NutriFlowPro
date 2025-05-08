
import React from 'react';
import PatientHeader from '@/components/Anthropometry/PatientHeader';
import NutritionSummary from '@/components/MealPlan/NutritionSummary';
import BreadcrumbNav from '@/components/MealPlan/BreadcrumbNav';
import MealPlanHeader from '@/components/MealPlan/MealPlanHeader';
import MealPlanForm from '@/components/MealPlan/MealPlanForm';
import { MealDistributionItem, ConsultationData } from '@/types';

interface MealPlanGeneratorUIProps {
  activePatient: { name: string; gender: string | null };
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
  handleSaveMealPlan,
}: MealPlanGeneratorUIProps) => {
  // Convert number to string for compatibility
  const formatNumber = (num: number): string => String(num);

  // Função simples para gerar PDF (será substituída no componente pai)
  const dummyGeneratePDF = async () => {
    await handleSaveMealPlan();
  };

  return (
    <div className="w-full">
      <BreadcrumbNav />
      
      <MealPlanHeader 
        generatePDF={dummyGeneratePDF}
        generating={isSaving}
      />
      
      {activePatient && (
        <PatientHeader 
          patientName={activePatient.name}
          patientAge={consultationData.age ? parseInt(formatNumber(consultationData.age)) : undefined}
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
      
      {totalMealPercent !== 100 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
          <strong>Nota:</strong> A distribuição total das refeições deve ser exatamente 100%. 
          Atual: {totalMealPercent}%
        </div>
      )}
    </div>
  );
};

export default MealPlanGeneratorUI;
