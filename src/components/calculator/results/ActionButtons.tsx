
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, FileText, Info } from 'lucide-react';

interface ActionButtonsProps {
  onSavePatient: () => void;
  onGenerateMealPlan: () => void;
  isSaving: boolean;
  hasResults: boolean;
  hasPatientName: boolean;
  userIsPremium: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSavePatient,
  onGenerateMealPlan,
  isSaving,
  hasResults,
  hasPatientName,
  userIsPremium
}) => {
  if (!hasResults) {
    return null;
  }
  
  return (
    <div className="mt-6 space-y-3">
      <Button
        className="w-full"
        onClick={onSavePatient}
        disabled={isSaving || !hasPatientName}
        variant="nutri-outline"
        animation="shimmer"
      >
        {isSaving ? (
          <span className="inline-flex items-center">
            <span className="animate-spin h-4 w-4 mr-2 border-2 border-dashed rounded-full border-current"></span>
            Salvando...
          </span>
        ) : (
          <span className="inline-flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Salvar Paciente
          </span>
        )}
      </Button>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                className="w-full"
                onClick={onGenerateMealPlan}
                disabled={!userIsPremium || !hasResults}
                variant={userIsPremium ? "nutri" : "ghost"}
                animation={userIsPremium ? "shimmer" : undefined}
              >
                <FileText className="mr-2 h-4 w-4" />
                Gerar Plano Alimentar
              </Button>
            </div>
          </TooltipTrigger>
          {!userIsPremium && (
            <TooltipContent side="bottom">
              <div className="flex items-start p-2">
                <Info className="h-4 w-4 mr-1 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="max-w-xs">Disponível apenas para assinantes Premium. Veja nossos planos na seção Preços.</p>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ActionButtons;
