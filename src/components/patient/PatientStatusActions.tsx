
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Archive, ArchiveRestore } from 'lucide-react';
import { Patient } from '@/types';
import { updatePatientStatus } from '@/services/patient/operations/updatePatientStatus';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';

interface PatientStatusActionsProps {
  patient: Patient;
  onStatusChange?: () => void;
}

const PatientStatusActions: React.FC<PatientStatusActionsProps> = ({ patient, onStatusChange }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  const isArchived = patient.status === 'archived';
  
  const handleStatusChange = async () => {
    setShowDialog(false);
    setIsLoading(true);
    
    try {
      const newStatus = isArchived ? 'active' : 'archived';
      const result = await updatePatientStatus(
        patient.id, 
        user?.id || '',
        newStatus as 'active' | 'archived'
      );
      
      if (!result.success) {
        throw new Error(result.error || `Falha ao ${isArchived ? 'reativar' : 'arquivar'} paciente`);
      }
      
      toast({
        title: isArchived ? "Paciente reativado" : "Paciente arquivado",
        description: `${patient.name} foi ${isArchived ? 'reativado(a)' : 'arquivado(a)'} com sucesso.`,
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      console.error(`Error ${isArchived ? 'reactivating' : 'archiving'} patient:`, error);
      toast({
        title: `Erro ao ${isArchived ? 'reativar' : 'arquivar'} paciente`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="ghost"
        className={`h-8 px-2 ${isArchived ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'}`}
        onClick={() => setShowDialog(true)}
        disabled={isLoading}
      >
        {isArchived ? (
          <>
            <ArchiveRestore className="h-3 w-3 mr-1" /> Reativar
          </>
        ) : (
          <>
            <Archive className="h-3 w-3 mr-1" /> Arquivar
          </>
        )}
      </Button>
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArchived ? 'Reativar Paciente' : 'Arquivar Paciente'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArchived
                ? `Tem certeza que deseja reativar ${patient.name}? O paciente voltará a aparecer na lista de pacientes ativos.`
                : `Tem certeza que deseja arquivar ${patient.name}? O paciente não aparecerá na lista padrão de pacientes.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusChange}
              className={isArchived ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}
            >
              {isArchived ? 'Sim, reativar' : 'Sim, arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PatientStatusActions;
