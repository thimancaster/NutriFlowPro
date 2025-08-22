import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useDebugPatients = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Patient debug error:', errorMessage);
    toast({
      title: "Erro de Debug",
      description: errorMessage,
      variant: "destructive"
    });
  }, [toast]);

  return {
    handleError
  };
};
