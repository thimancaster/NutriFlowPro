
import { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Patient } from '@/types';
import { updatePatientStatus } from '@/services/patient/operations/updatePatientStatus';
import { updatePatient } from '@/services/patient/operations/updatePatient';
import { useToast } from '@/hooks/use-toast';

interface UsePatientModalActionsProps {
  patient: Patient;
  onStatusChange: () => void;
  onClose: () => void;
}

export const usePatientModalActions = ({
  patient,
  onStatusChange,
  onClose
}: UsePatientModalActionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);
  
  // Archive patient
  const handleArchivePatient = async () => {
    if (!user) return;
    
    setIsArchiving(true);
    try {
      const result = await updatePatientStatus(patient.id, 'archived' as 'active' | 'archived', user.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: 'Paciente arquivado',
        description: `O paciente ${patient.name} foi arquivado com sucesso.`,
      });
      
      onStatusChange();
      onClose();
    } catch (error: any) {
      console.error('Error archiving patient:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível arquivar o paciente: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsArchiving(false);
    }
  };
  
  //  Update patient
  const handleUpdatePatient = async (updatedData: Partial<Patient>) => {
    if (!user) return;
    
    try {
      const result = await updatePatient(patient.id, updatedData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: 'Paciente atualizado',
        description: 'As informações do paciente foram atualizadas com sucesso.',
      });
      
      return result.data;
    } catch (error: any) {
      console.error('Error updating patient:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível atualizar o paciente: ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Update patient notes
  const handleUpdatePatientNotes = async (notes: string) => {
    return handleUpdatePatient({ notes });
  };
  
  return {
    isArchiving,
    handleArchivePatient,
    handleUpdatePatient,
    handleUpdatePatientNotes
  };
};
