
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deletePatient } from '@/services/patient/operations/deletePatient';

/**
 * Hook for patient deletion
 */
export const usePatientDelete = (userId: string | undefined, onSuccess?: () => void) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePatient = useCallback(async (patientId: string) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const result = await deletePatient(patientId, userId);
      
      if (!result.success) throw new Error(result.error);
      
      toast({
        title: 'Success',
        description: 'Patient deleted successfully.',
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error deleting patient:', err);
      
      toast({
        title: 'Error',
        description: `Failed to delete patient: ${(err as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [userId, toast, onSuccess]);

  return { handleDeletePatient, isDeleting };
};
