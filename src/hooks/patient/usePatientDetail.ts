
import { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PatientService } from '@/services/patient';
import { useQuery } from '@tanstack/react-query';

export const usePatientDetail = (patientId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const {
    data: patient,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) {
        return null;
      }
      
      try {
        const result = await PatientService.getPatient(patientId);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load patient data');
        }
        
        return result.data;
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
