
import { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PatientService } from '@/services/patient';
import { useQuery } from '@tanstack/react-query';

// Define an interface for the patient response
interface PatientResponse {
  success: boolean;
  data?: Patient;
  error?: string;
}

export const usePatientDetail = (patientId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const {
    data: patientResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async (): Promise<PatientResponse> => {
      if (!patientId) {
        return { success: false, error: 'No patient ID provided' };
      }
      
      try {
        const result = await PatientService.getPatient(patientId);
        return result as PatientResponse;
      } catch (error: any) {
        toast({
          title: 'Error loading patient',
          description: error.message || 'Failed to load patient data',
          variant: 'destructive'
        });
        throw error;
      }
    },
    enabled: !!patientId && !!user
  });

  // Extract the actual patient data from the response
  const patient = patientResponse?.success ? patientResponse.data : null;
  const isPatientArchived = patient?.status === 'archived';
  
  // Add functions to show/hide dialogs
  const openArchiveDialog = () => setShowArchiveDialog(true);
  const closeArchiveDialog = () => setShowArchiveDialog(false);
  const openDeleteDialog = () => setShowDeleteDialog(true);
  const closeDeleteDialog = () => setShowDeleteDialog(false);
  
  return {
    patient,
    isLoading,
    error,
    refetch,
    isSaving,
    setIsSaving,
    isDeleting,
    setIsDeleting,
    isPatientArchived,
    showArchiveDialog,
    showDeleteDialog,
    openArchiveDialog,
    closeArchiveDialog,
    openDeleteDialog,
    closeDeleteDialog
  };
};
