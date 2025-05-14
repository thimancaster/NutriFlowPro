
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PatientService } from '@/services/patient';

export const usePatientModalActions = ({ patient, onStatusChange, onClose }) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  // Handle archiving/unarchiving a patient
  const handleArchivePatient = async () => {
    setIsArchiving(true);
    
    try {
      const newStatus = patient.status === 'active' ? 'archived' : 'active';
      await PatientService.updatePatientStatus(patient.id, newStatus);
      
      toast({
        title: patient.status === 'active' ? "Paciente arquivado" : "Paciente reativado",
        description: patient.status === 'active' 
          ? "O paciente foi arquivado com sucesso" 
          : "O paciente foi reativado com sucesso"
      });
      
      // Notify parent component to refresh the list
      onStatusChange();
      
      // Close the modal
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o status do paciente",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
    }
  };
  
  // Handle updating patient data
  const handleUpdatePatient = async (updatedData) => {
    try {
      await PatientService.updatePatient(patient.id, updatedData);
      
      toast({
        title: "Atualizado",
        description: "Dados do paciente atualizados com sucesso"
      });
      
      // Notify parent component to refresh the list
      onStatusChange();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar os dados do paciente",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Handle updating patient notes specifically
  const handleUpdatePatientNotes = async (notes) => {
    try {
      await PatientService.updatePatient(patient.id, { notes });
      
      toast({
        title: "Atualizado",
        description: "Observações do paciente atualizadas com sucesso"
      });
      
      // Notify parent component to refresh the list
      onStatusChange();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar as observações do paciente",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    isArchiving,
    handleArchivePatient,
    handleUpdatePatient,
    handleUpdatePatientNotes
  };
};
