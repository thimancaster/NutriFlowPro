
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { globalErrorHandler } from '@/utils/errorHandler';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useAsyncOperation = <T = any>(options: UseAsyncOperationOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      setData(result);
      
      if (options.successMessage) {
        toast({
          title: 'Sucesso',
          description: options.successMessage,
        });
      }
      
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      
      if (options.errorMessage) {
        toast({
          title: 'Erro',
          description: options.errorMessage,
          variant: 'destructive'
        });
      }
      
      globalErrorHandler(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, options]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    reset,
    isLoading,
    error,
    data,
    hasError: !!error,
    hasData: !!data
  };
};
