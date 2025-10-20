
import React from 'react';
import { useActivePatient } from '@/hooks/useActivePatient';
import PdfActionButtons from './PdfActionButtons';
import ShareActionButtons from './ShareActionButtons';
import SaveActionButton from './SaveActionButton';

interface MealPlanActionsProps {
  onSave?: () => Promise<void>;
}

const MealPlanActions: React.FC<MealPlanActionsProps> = ({ onSave }) => {
  const { patient: activePatient } = useActivePatient();
  
  // TODO: Get mealPlan from appropriate context when needed
  const mealPlan = null;
  
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
        <SaveActionButton onSave={onSave} />
      )}
    </div>
  );
};

export default MealPlanActions;
