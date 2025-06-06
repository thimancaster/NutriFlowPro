
import React from 'react';
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
import { Loader2, Trash } from 'lucide-react';

interface PatientDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  isDeleting: boolean;
  patientName: string;
}

const PatientDeleteDialog: React.FC<PatientDeleteDialogProps> = ({
  open,
  onClose,
  onDelete,
  isDeleting,
  patientName
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white dark:bg-dark-bg-elevated border-gray-200 dark:border-dark-border-secondary">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 dark:text-dark-text-primary">Excluir paciente</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-dark-text-secondary">
            Você está prestes a excluir permanentemente o paciente <strong className="text-gray-900 dark:text-dark-text-primary">{patientName}</strong>. 
            Esta ação não pode ser desfeita. Todos os dados associados a este paciente 
            serão permanentemente removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="text-gray-700 dark:text-dark-text-secondary">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PatientDeleteDialog;
