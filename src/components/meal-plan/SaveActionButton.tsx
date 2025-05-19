
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
      variant="primary" 
      animation="shimmer"
      onClick={() => onSave()}
      disabled={isSaving}
      className="flex items-center gap-2"
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
