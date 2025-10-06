
import React from 'react';
import { useConsultation } from '@/contexts/ConsultationContext';
import PdfActionButtons from '@/components/meal-plan/PdfActionButtons';
import ShareActionButtons from '@/components/meal-plan/ShareActionButtons';
import SaveActionButton from '@/components/meal-plan/SaveActionButton';

interface MealPlanActionsProps {
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

const MealPlanActions: React.FC<MealPlanActionsProps> = ({ onSave, isSaving = false }) => {
  const { activePatient, mealPlan } = useConsultation();
  
  if (!mealPlan || !activePatient) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <PdfActionButtons 
        activePatient={activePatient} 
        mealPlan={mealPlan} 
      />
      
      <ShareActionButtons 
        activePatient={activePatient} 
      />
      
      {onSave && (
        <SaveActionButton onSave={onSave} isSaving={isSaving} />
      )}
    </div>
  );
};

export default MealPlanActions;
