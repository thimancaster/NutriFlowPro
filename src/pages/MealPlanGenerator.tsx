
import React from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useMealPlanState } from '@/hooks/useMealPlanState';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSaveConsultation } from '@/hooks/useSaveConsultation';
import { MealDistributionItem } from '@/types/meal';
import MealPlanGeneratorUI from '@/components/MealPlan/MealPlanGeneratorUI';

const MealPlanGenerator: React.FC = () => {
  const { activePatient } = usePatient();
  const { consultationData } = useConsultationData();
  const { mealPlan, setMealPlan } = useMealPlan();
  const { saveConsultation } = useSaveConsultation();
  const { saveMealPlan } = useMealPlan();

  // Default meal distribution setup
  const defaultMealDistribution: MealDistributionItem[] = [
    { id: '1', name: 'Café da manhã', percent: 25, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '2', name: 'Lanche da manhã', percent: 10, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '3', name: 'Almoço', percent: 30, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '4', name: 'Lanche da tarde', percent: 10, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '5', name: 'Jantar', percent: 20, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '6', name: 'Ceia', percent: 5, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] }
  ];

  const {
    mealDistribution,
    totalMealPercent,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan,
    addMeal,
    removeMeal
  } = useMealPlanState({
    activePatient,
    consultationData,
    mealPlan,
    setMealPlan,
    saveConsultation,
    saveMealPlan
  });

  if (!activePatient || !consultationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Dados incompletos</h2>
          <p className="text-gray-600">
            É necessário selecionar um paciente e ter dados de consulta para gerar o plano alimentar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MealPlanGeneratorUI
      activePatient={activePatient}
      consultationData={consultationData}
      mealDistribution={mealDistribution}
      totalMealPercent={totalMealPercent}
      isSaving={isSaving}
      handleMealPercentChange={handleMealPercentChange}
      handleSaveMealPlan={handleSaveMealPlan}
      handleAddMeal={addMeal}
      handleRemoveMeal={removeMeal}
    />
  );
};

export default MealPlanGenerator;
