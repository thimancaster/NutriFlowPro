
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
          variant="outline"
          className="border-nutri-blue text-nutri-blue flex items-center gap-2"
          disabled={isSavingPatient}
        >
          {isSavingPatient ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4 mr-1" />
          )}
          Salvar Paciente
        </Button>
      )}
      
      <Button 
        onClick={handleGenerateMealPlan} 
        className="bg-nutri-green hover:bg-nutri-green-dark flex items-center gap-2"
        size="default"
      >
        Gerar Plano Alimentar
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ActionButtons;
