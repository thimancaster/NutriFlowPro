
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, UserPlus } from 'lucide-react';

interface ActionButtonsProps {
  handleSavePatient: () => void;
  handleGenerateMealPlan: () => void;
  isSavingPatient: boolean;
  hasPatientName: boolean;
  user: any;
}

const ActionButtons = ({
  handleSavePatient,
  handleGenerateMealPlan,
  isSavingPatient,
  hasPatientName,
  user
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {user && hasPatientName && (
        <Button 
          onClick={handleSavePatient}
          variant="nutri-outline-blue"
          disabled={isSavingPatient}
          animation="shimmer"
        >
          {isSavingPatient ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Salvar Paciente
        </Button>
      )}
      
      <Button 
        onClick={handleGenerateMealPlan} 
        variant="primary"
        animation="shimmer"
      >
        Gerar Plano Alimentar
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ActionButtons;
