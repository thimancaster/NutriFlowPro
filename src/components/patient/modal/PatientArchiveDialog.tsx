
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
import { Loader2 } from 'lucide-react';

interface PatientArchiveDialogProps {
  open: boolean;
  onClose: () => void;
  onArchive: () => Promise<void>;
  isArchiving: boolean;
  patientName: string;
}

const PatientArchiveDialog: React.FC<PatientArchiveDialogProps> = ({
  open,
  onClose,
  onArchive,
  isArchiving,
  patientName
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arquivar paciente</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a arquivar o paciente <strong>{patientName}</strong>. 
            Pacientes arquivados não aparecem na listagem principal, 
            mas podem ser restaurados mais tarde.
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
            className="bg-red-600 hover:bg-red-700"
          >
            {isArchiving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Arquivando...
              </>
            ) : (
              'Arquivar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PatientArchiveDialog;
