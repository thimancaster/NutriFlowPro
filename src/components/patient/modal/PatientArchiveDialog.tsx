
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
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const PatientArchiveDialog = ({
  patient,
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: PatientArchiveDialogProps) => {
  const isActive = patient.status === 'active';
  const action = isActive ? 'arquivar' : 'reativar';
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Arquivar paciente' : 'Reativar paciente'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive 
              ? 'Tem certeza que deseja arquivar este paciente? Pacientes arquivados não aparecerão na listagem principal.'
              : 'Tem certeza que deseja reativar este paciente? Pacientes reativados voltarão a aparecer na listagem principal.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className={isActive ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoading 
              ? 'Processando...' 
              : isActive ? 'Sim, arquivar' : 'Sim, reativar'
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PatientArchiveDialog;
