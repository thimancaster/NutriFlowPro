
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MealPlanMeal } from '@/types/mealPlan';

interface MealEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: MealPlanMeal | null;
  onSave: (meal: MealPlanMeal) => void;
}

const MealEditDialog: React.FC<MealEditDialogProps> = ({
  open,
  onOpenChange,
  meal,
  onSave
}) => {
  if (!meal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Refeição: {meal.name}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Funcionalidade de edição de refeição será implementada em breve.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MealEditDialog;
