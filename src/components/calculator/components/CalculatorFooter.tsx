
import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CalculatorFooterProps {
  showResults: boolean;
  patientData?: Patient | null;
  onViewProfile?: () => void;
  onSaveCalculation: () => void;
  onGenerateMealPlan: () => void;
  onReset: () => void;
  isSaving: boolean;
}

export const CalculatorFooter: React.FC<CalculatorFooterProps> = ({
  showResults,
  patientData,
  onViewProfile,
  onSaveCalculation,
  onGenerateMealPlan,
  onReset,
  isSaving
}) => {
  const { toast } = useToast();

  const handleSaveWithoutPatient = () => {
    toast({
      title: "Selecione um paciente",
      description: "Para salvar os resultados, você precisa selecionar um paciente.",
    });
  };

  return (
    <CardFooter className="flex justify-between">
      <Button variant="outline" onClick={onReset}>
        Limpar Dados
      </Button>
      
      {showResults && patientData && (
        <div className="flex gap-2">
          {onViewProfile && (
            <Button
              variant="secondary"
              onClick={onViewProfile}
            >
              <User className="mr-2 h-4 w-4" />
              Ver Perfil
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={onSaveCalculation}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Resultados'}
          </Button>
          
          <Button 
            variant="nutri"
            onClick={onGenerateMealPlan}
            disabled={isSaving}
          >
            Gerar Plano Alimentar
          </Button>
        </div>
      )}
      
      {showResults && !patientData && (
        <Button 
          variant="nutri"
          onClick={handleSaveWithoutPatient}
        >
          Salvar Resultados
        </Button>
      )}
    </CardFooter>
  );
};
