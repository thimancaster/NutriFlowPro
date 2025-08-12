import React from 'react';
import MealPlanList from '@/components/meal-plan/MealPlanList';
import { MealPlanFilters } from '@/types/mealPlan';

interface PatientMealPlansProps {
  patientId: string;
}

const PatientMealPlans: React.FC<PatientMealPlansProps> = ({ patientId }) => {
  const filters: MealPlanFilters = {
    patientId: patientId
  };

  return (
    <div>
      <MealPlanList filters={filters} />
    </div>
  );
};

export default PatientMealPlans;
