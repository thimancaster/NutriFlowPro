
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PatientActionButtonsProps {
  onCancel: () => void;
}

const PatientActionButtons: React.FC<PatientActionButtonsProps> = ({ onCancel }) => {
  return (
    <div className="flex justify-end">
      <Button 
        variant="outline" 
        onClick={onCancel}
        size="sm"
      >
        <X className="h-4 w-4 mr-1" />
        Fechar
      </Button>
    </div>
  );
};

export default PatientActionButtons;
