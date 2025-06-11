
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
      <AlertDialogContent className="bg-white dark:bg-dark-bg-elevated border-gray-200 dark:border-dark-border-secondary">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 dark:text-dark-text-primary">
            {isActive ? 'Arquivar paciente' : 'Reativar paciente'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-dark-text-secondary">
            {isActive ? (
              <>Você está prestes a arquivar o paciente <strong className="text-gray-900 dark:text-dark-text-primary">{patientName}</strong>. 
              Pacientes arquivados não aparecem na listagem principal, 
              mas podem ser restaurados mais tarde.</>
            ) : (
              <>Você está prestes a reativar o paciente <strong className="text-gray-900 dark:text-dark-text-primary">{patientName}</strong>. 
              Pacientes ativos aparecem na listagem principal.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving} className="text-gray-700 dark:text-dark-text-secondary">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onArchive();
            }}
            disabled={isArchiving}
            className={isActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
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
