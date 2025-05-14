
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';

interface UsePatientModalActionsProps {
  patient: Patient;
  onClose: () => void;
  onStatusChange?: () => void;
}

export const usePatientModalActions = ({ patient, onClose, onStatusChange }: UsePatientModalActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  
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
  
  const handleArchivePatient = async () => {
    setIsArchiving(true);
    
    try {
      await handleStatusChange(patient);
    } finally {
      setIsArchiving(false);
    }
  };
  
  const handleUpdatePatient = async (updatedData: Partial<Patient>) => {
    try {
      const result = await PatientService.savePatient({
        ...patient,
        ...updatedData
      });
      
      if (result.success) {
        toast({
          title: "Dados atualizados",
          description: "Os dados do paciente foram atualizados com sucesso."
        });
        
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível atualizar os dados do paciente. ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleUpdatePatientNotes = async (notes: string) => {
    try {
      const result = await PatientService.savePatient({
        ...patient,
        notes
      });
      
      if (result.success) {
        toast({
          title: "Notas atualizadas",
          description: "As notas foram atualizadas com sucesso."
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível atualizar as notas. ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
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
    isArchiving,
    handleEditClick,
    handleArchiveClick,
    handleReactivateClick,
    handleNewAppointment,
    handleStatusChange,
    handleArchivePatient,
    handleUpdatePatient,
    handleUpdatePatientNotes
  };
};
