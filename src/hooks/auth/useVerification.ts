
import { useRef, useCallback } from 'react';
import { AUTH_CONSTANTS } from '@/constants/authConstants';
import { useToast } from '@/hooks/use-toast';

export const useVerification = () => {
  const { toast } = useToast();
  
  // Track if the component is mounted
  const isMountedRef = useRef(true);
  // Track verification attempts
  const verificationAttemptsRef = useRef(0);
  // Track verification timeout ID
  const verificationTimeoutRef = useRef<number | null>(null);

  // Clear verification timeout to prevent memory leaks
  const clearVerificationTimeout = useCallback(() => {
    if (verificationTimeoutRef.current) {
      window.clearTimeout(verificationTimeoutRef.current);
      verificationTimeoutRef.current = null;
    }
  }, []);

  // Set verification timeout to break infinite loops
  const setVerificationTimeout = useCallback((setAuthState: (prev: any) => void) => {
    clearVerificationTimeout();
    
    verificationTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      
      if (verificationAttemptsRef.current >= AUTH_CONSTANTS.MAX_VERIFICATION_ATTEMPTS) {
        console.error('Authentication verification timed out after multiple attempts');
        setAuthState((prev: any) => ({ 
          ...prev, 
          isLoading: false, 
          loading: false, 
          isAuthenticated: false,
          user: null,
          session: null 
        }));
        
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível verificar sua sessão. Por favor, faça login novamente.",
          variant: "destructive"
        });
      }
    }, AUTH_CONSTANTS.VERIFICATION_TIMEOUT);
    
    return () => clearVerificationTimeout();
  }, [clearVerificationTimeout, toast]);

  const incrementVerificationAttempt = () => {
    verificationAttemptsRef.current += 1;
    console.log(`Session verification attempt ${verificationAttemptsRef.current}`);
  };

  const resetVerificationAttempts = () => {
    verificationAttemptsRef.current = 0;
  };

  return {
    isMountedRef,
    clearVerificationTimeout,
    setVerificationTimeout,
    incrementVerificationAttempt,
    resetVerificationAttempts
  };
};

export default useVerification;
