
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Patient } from '@/types';

interface PatientArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchive: () => void;
  isArchiving: boolean;
  patientName: string;
}

const PatientArchiveDialog = ({
  open,
  onOpenChange,
  onArchive,
  isArchiving,
  patientName
}: PatientArchiveDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Arquivar paciente
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja arquivar o paciente <strong>{patientName}</strong>? 
            Pacientes arquivados não aparecerão na listagem principal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onArchive}
            disabled={isArchiving}
            className="bg-red-600 hover:bg-red-700"
          >
            {isArchiving ? 'Processando...' : 'Sim, arquivar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PatientArchiveDialog;
