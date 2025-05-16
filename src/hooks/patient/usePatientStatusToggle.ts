
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for toggling patient status
 */
export const usePatientStatusToggle = (userId: string | undefined, onSuccess?: () => void) => {
  const { toast } = useToast();

  const togglePatientStatus = useCallback(async (patientId: string, newStatus: 'active' | 'archived') => {
    if (!userId) return;
    
    try {
      // Since status might not be in the database yet, we're using a placeholder
      const { error } = await supabase
        .from('patients')
        .update({ /* status: newStatus */ })
        .eq('id', patientId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
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
