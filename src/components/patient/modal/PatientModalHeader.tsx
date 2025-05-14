
import React from 'react';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Patient } from '@/types';

interface PatientModalHeaderProps {
  patient: Patient;
  onClose: () => void;
}

const PatientModalHeader = ({ patient, onClose }: PatientModalHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <DialogTitle className="text-2xl">{patient.name}</DialogTitle>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PatientModalHeader;
