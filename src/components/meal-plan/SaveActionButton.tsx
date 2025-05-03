
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface SaveActionButtonProps {
  onSave: () => Promise<void>;
}

const SaveActionButton: React.FC<SaveActionButtonProps> = ({ onSave }) => {
  return (
    <Button 
      className="bg-nutri-green hover:bg-nutri-green-dark flex gap-2"
      onClick={onSave}
    >
      <FileText className="h-4 w-4" />
      Salvar Plano
    </Button>
  );
};

export default SaveActionButton;
