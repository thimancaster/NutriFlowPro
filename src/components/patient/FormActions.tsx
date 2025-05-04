
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  isLoading: boolean;
  onCancel?: () => void;
  isEditMode: boolean;
}

const FormActions = ({ isLoading, onCancel, isEditMode }: FormActionsProps) => {
  return (
    <div className="flex justify-end">
      {onCancel && (
        <Button variant="outline" type="button" onClick={onCancel} className="mr-2">
          Cancelar
        </Button>
      )}
      <Button 
        type="submit" 
        className="bg-nutri-green hover:bg-nutri-green-dark"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isEditMode ? "Atualizando..." : "Salvando..."}
          </>
        ) : (
          isEditMode ? "Atualizar Paciente" : "Salvar Paciente"
        )}
      </Button>
    </div>
  );
};

export default FormActions;
