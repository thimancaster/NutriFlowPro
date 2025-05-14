
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';

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
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  // Handle archiving a patient
  const handleArchivePatient = async () => {
    setIsArchiving(true);
    
    try {
      // Determine the new status (toggle between archived and active)
      const newStatus = patient.status === 'archived' ? 'active' : 'archived';
      
      // Call API to update patient status
      const result = await PatientService.updatePatientStatus(patient.id, newStatus, patient.user_id);
      
      if (!result.success) {
        throw new Error(result.error || "Falha ao atualizar o status do paciente");
      }
      
      // Show success toast
      toast({
        title: newStatus === 'archived' ? "Paciente arquivado" : "Paciente ativado",
        description: newStatus === 'archived' 
          ? "O paciente foi arquivado com sucesso."
          : "O paciente foi ativado com sucesso."
      });
      
      // Update local state and close modals
      onStatusChange();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status do paciente",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
    }
  };

  // Handle updating patient basic info
  const handleUpdatePatient = async (updatedData: Partial<Patient>) => {
    try {
      // Validate required fields
      if (!updatedData.name || !updatedData.gender) {
        toast({
          title: "Dados incompletos",
          description: "Nome e gênero são campos obrigatórios",
          variant: "destructive"
        });
        return;
      }
      
      // Merge updated data with existing patient data
      const mergedData = { ...patient, ...updatedData, user_id: patient.user_id };
      
      // Call API to update patient
      const result = await PatientService.savePatient(mergedData);
      
      if (!result.success) {
        throw new Error(result.error || "Falha ao atualizar o paciente");
      }
      
      // Show success toast
      toast({
        title: "Paciente atualizado",
        description: "Os dados do paciente foram atualizados com sucesso."
      });
      
      // Update local state
      onStatusChange(); // Refresh patient list
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o paciente",
        variant: "destructive"
      });
    }
  };

  // Handle updating patient notes
  const handleUpdatePatientNotes = async (notes: string) => {
    try {
      // Call API to update patient
      const result = await PatientService.savePatient({ 
        ...patient, 
        notes, 
        user_id: patient.user_id 
      });
      
      if (!result.success) {
        throw new Error(result.error || "Falha ao salvar as anotações");
      }
      
      // Show success toast
      toast({
        title: "Anotações salvas",
        description: "As anotações do paciente foram salvas com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar as anotações",
        variant: "destructive"
      });
      throw error; // Re-throw to allow handling in the component
    }
  };

  return {
    isArchiving,
    handleArchivePatient,
    handleUpdatePatient,
    handleUpdatePatientNotes
  };
};
