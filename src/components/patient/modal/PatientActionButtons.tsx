
import React from 'react';
import { Button } from '@/components/ui/button';

interface PatientActionButtonsProps {
  onCancel: () => void;
}

const PatientActionButtons: React.FC<PatientActionButtonsProps> = ({ 
  onCancel 
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel}>
        Fechar
      </Button>
    </div>
  );
};

export default PatientActionButtons;
