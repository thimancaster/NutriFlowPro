
import { useCallback } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const usePatientOperations = () => {
  const { 
    savePatient, 
    refreshPatients, 
    isLoading, 
    error,
    addRecentPatient 
  } = usePatient();
  
  const { toast } = useToast();

  const createPatient = useCallback(async (patientData: Partial<Patient>) => {
    try {
      console.log('Creating new patient:', patientData);
      
      const result = await savePatient(patientData);
      
      if (result.success && result.data) {
        toast({
          title: "Paciente criado",
          description: `${result.data.name} foi adicionado com sucesso.`
        });
        return result.data;
      } else {
        throw new Error(result.error || 'Falha ao criar paciente');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: "Erro ao criar paciente",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    }
  }, [savePatient, toast]);

  const updatePatient = useCallback(async (patientId: string, updates: Partial<Patient>) => {
    try {
      console.log('Updating patient:', patientId, updates);
      
      const patientData = { ...updates, id: patientId };
      const result = await savePatient(patientData);
      
      if (result.success && result.data) {
        toast({
          title: "Paciente atualizado",
          description: `${result.data.name} foi atualizado com sucesso.`
        });
        return result.data;
      } else {
        throw new Error(result.error || 'Falha ao atualizar paciente');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Erro ao atualizar paciente",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    }
  }, [savePatient, toast]);

  const deletePatient = useCallback(async (patientId: string) => {
    try {
      console.log('Deleting patient:', patientId);
      
      // For now, we'll implement soft delete by updating status
      const result = await savePatient({ 
        id: patientId, 
        status: 'inactive' 
      });
      
      if (result.success) {
        await refreshPatients();
        toast({
          title: "Paciente removido",
          description: "Paciente foi removido com sucesso."
        });
        return true;
      } else {
        throw new Error(result.error || 'Falha ao remover paciente');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Erro ao remover paciente",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    }
  }, [savePatient, refreshPatients, toast]);

  const duplicatePatient = useCallback(async (originalPatient: Patient) => {
    try {
      const duplicatedData = {
        ...originalPatient,
        id: undefined, // Remove ID to create new patient
        name: `${originalPatient.name} (Cópia)`,
        email: undefined, // Remove unique fields
        cpf: undefined,
      };
      
      return await createPatient(duplicatedData);
    } catch (error) {
      console.error('Error duplicating patient:', error);
      throw error;
    }
  }, [createPatient]);

  const bulkOperations = {
    activate: useCallback(async (patientIds: string[]) => {
      const promises = patientIds.map(id => 
        updatePatient(id, { status: 'active' })
      );
      return Promise.allSettled(promises);
    }, [updatePatient]),
    
    deactivate: useCallback(async (patientIds: string[]) => {
      const promises = patientIds.map(id => 
        updatePatient(id, { status: 'inactive' })
      );
      return Promise.allSettled(promises);
    }, [updatePatient]),
  };

  return {
    // State
    isLoading,
    error,
    
    // CRUD Operations
    createPatient,
    updatePatient,
    deletePatient,
    duplicatePatient,
    
    // Bulk Operations
    bulkOperations,
    
    // Utility
    refreshPatients,
    addRecentPatient,
  };
};
