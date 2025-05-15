
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';

interface SaveActionButtonProps {
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

const SaveActionButton: React.FC<SaveActionButtonProps> = ({ onSave, isSaving = false }) => {
  return (
    <Button 
      className="bg-nutri-green hover:bg-nutri-green-dark flex gap-2 transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      onClick={() => onSave()}
      disabled={isSaving}
      animation="shimmer"
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isSaving ? "Salvando..." : "Salvar Plano"}
    </Button>
  );
};

export default SaveActionButton;
