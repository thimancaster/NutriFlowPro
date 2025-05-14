
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Archive, RotateCcw, Clock } from 'lucide-react';
import { Patient } from '@/types';

interface PatientActionButtonsProps {
  patient: Patient;
  onEdit: () => void;
  onArchive: () => void;
  onReactivate: () => void;
  onNewAppointment: () => void;
}

const PatientActionButtons = ({
  patient,
  onEdit,
  onArchive,
  onReactivate,
  onNewAppointment
}: PatientActionButtonsProps) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil className="h-4 w-4 mr-1" /> Editar
      </Button>
      
      {patient.status === 'active' ? (
        <Button variant="outline" size="sm" onClick={onArchive}>
          <Archive className="h-4 w-4 mr-1" /> Arquivar
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={onReactivate}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reativar
        </Button>
      )}
      
      <Button size="sm" onClick={onNewAppointment}>
        <Clock className="h-4 w-4 mr-1" /> Novo Agendamento
      </Button>
    </div>
  );
};

export default PatientActionButtons;
