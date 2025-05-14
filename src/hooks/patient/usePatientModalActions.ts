
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';

interface UsePatientModalActionsProps {
  onClose: () => void;
  onStatusChange?: () => void;
}

export const usePatientModalActions = ({ onClose, onStatusChange }: UsePatientModalActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEditClick = (patientId: string) => {
    navigate(`/patients/edit/${patientId}`);
    onClose();
  };
  
  const handleArchiveClick = () => {
    setIsArchiveDialogOpen(true);
  };
  
  const handleReactivateClick = () => {
    setIsArchiveDialogOpen(true);
  };
  
  const handleNewAppointment = () => {
    toast({
      description: "Funcionalidade em desenvolvimento"
    });
  };
  
  const handleStatusChange = async (patient: Patient) => {
    if (!patient) return;
    
    setIsLoading(true);
    
    const newStatus = patient.status === 'active' ? 'archived' : 'active';
    
    try {
      const result = await PatientService.updatePatientStatus(patient.id, newStatus);
      
      if (result.success) {
        toast({
          title: newStatus === 'active' ? "Paciente reativado" : "Paciente arquivado",
          description: `${patient.name} foi ${newStatus === 'active' ? 'reativado(a)' : 'arquivado(a)'} com sucesso.`
        });
        
        if (onStatusChange) {
          onStatusChange();
        }
        
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível ${newStatus === 'active' ? 'reativar' : 'arquivar'} o paciente. ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsArchiveDialogOpen(false);
    }
  };

  return {
    isArchiveDialogOpen,
    setIsArchiveDialogOpen,
    isLoading,
    handleEditClick,
    handleArchiveClick,
    handleReactivateClick,
    handleNewAppointment,
    handleStatusChange
  };
};
