
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Patient } from '@/types';

interface PatientArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchive: () => Promise<void>;
  isArchiving: boolean;
  patientName: string;
  status: 'active' | 'archived';
}

const PatientArchiveDialog: React.FC<PatientArchiveDialogProps> = ({
  open,
  onOpenChange,
  onArchive,
  isArchiving,
  patientName,
  status
}) => {
  const isActive = status === 'active';
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Arquivar paciente' : 'Reativar paciente'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive ? (
              <>Você está prestes a arquivar o paciente <strong>{patientName}</strong>. 
              Pacientes arquivados não aparecem na listagem principal, 
              mas podem ser restaurados mais tarde.</>
            ) : (
              <>Você está prestes a reativar o paciente <strong>{patientName}</strong>. 
              Pacientes ativos aparecem na listagem principal.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onArchive();
            }}
            disabled={isArchiving}
            className={isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isArchiving ? (
              `${isActive ? 'Arquivando...' : 'Reativando...'}`
            ) : (
              isActive ? 'Arquivar' : 'Reativar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PatientArchiveDialog;
