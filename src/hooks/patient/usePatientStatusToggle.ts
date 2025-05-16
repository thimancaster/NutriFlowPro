
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { updatePatientStatus } from '@/services/patient/operations/updatePatientStatus';

/**
 * Hook for toggling patient status
 */
export const usePatientStatusToggle = (userId: string | undefined, onSuccess?: () => void) => {
  const { toast } = useToast();

  const togglePatientStatus = useCallback(async (patientId: string, newStatus: 'active' | 'archived') => {
    if (!userId) return;
    
    try {
      const result = await updatePatientStatus(patientId, userId, newStatus);
      
      if (!result.success) throw new Error(result.error);
      
      toast({
        title: 'Success',
        description: `Patient ${newStatus === 'active' ? 'activated' : 'archived'} successfully.`,
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error updating patient status:', err);
      
      toast({
        title: 'Error',
        description: `Failed to update patient status: ${(err as Error).message}`,
        variant: 'destructive',
      });
    }
  }, [userId, toast, onSuccess]);

  return { togglePatientStatus };
};
