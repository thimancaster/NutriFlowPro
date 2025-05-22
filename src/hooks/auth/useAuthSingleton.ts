
import { useRef, useEffect } from 'react';
import { AuthState, StoredSession } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { AUTH_STORAGE_KEYS } from '@/constants/authConstants';
import { storageUtils } from '@/utils/storageUtils';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

// Singleton pattern to ensure only one auth listener exists
let authListenerInitialized = false;
let globalAuthSubscription: { unsubscribe: () => void } | null = null;

/**
 * Hook that ensures a single authentication listener is established
 * across the entire application
 */
export const useAuthSingleton = (
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>,
  loadStoredSession: () => StoredSession,
  saveSession: (session: any, remember: boolean) => void
) => {
  const { toast } = useToast();
  const authListenerRef = useRef<{ unsubscribe: () => void } | null>(null);
  
  // Setup auth listener once for the entire app
  useEffect(() => {
    // Only initialize if not already done
    if (!authListenerInitialized) {
      logger.info('Initializing global auth listener (singleton)');
      
      // Setup auth state change listener
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        logger.debug(`Auth state changed: ${event} Session: ${session ? 'exists' : 'null'}`);
        
        // Get remember me preference
        const rememberMe = storageUtils.getLocalItem(AUTH_STORAGE_KEYS.REMEMBER_ME) || false;
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado",
            description: "Você foi autenticado com sucesso."
          });
          
          // Update auth state with session and remember me preference
          setAuthState(prev => ({
            ...prev,
            user: session?.user || null,
            session: session,
            isAuthenticated: true,
            isLoading: false,
            loading: false
          }));
          
          saveSession(session, rememberMe);
          storageUtils.setLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, Date.now());
          
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Sessão encerrada",
            description: "Você foi desconectado com sucesso."
          });
          
          // Clear session data
          saveSession(null, false);
          storageUtils.setLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, Date.now());
          
          // Update auth state
          setAuthState(prev => ({
            ...prev,
            user: null, 
            session: null,
            isAuthenticated: false,
            isLoading: false,
            loading: false
          }));
          
        } else if (event === 'TOKEN_REFRESHED') {
          logger.debug('Token refreshed successfully');
          
          // Update auth state with refreshed session
          setAuthState(prev => ({
            ...prev,
            user: session?.user || null,
            session: session,
            isAuthenticated: true,
            isLoading: false,
            loading: false
          }));
          
          saveSession(session, rememberMe);
          storageUtils.setLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, Date.now());
        }
      });
      
      // Store the subscription reference
      authListenerRef.current = data.subscription;
      globalAuthSubscription = data.subscription;
      authListenerInitialized = true;
      
      // Initial session check
      const initialCheck = async () => {
        try {
          // Try to load session from storage first (for remember me)
          const { session: storedSession, remember } = loadStoredSession();
          
          // If we have a stored session and remember me is enabled, use that
          if (storedSession && remember) {
            logger.debug("Using stored session from localStorage");
            setAuthState(prev => ({
              ...prev,
              user: storedSession.user,
              session: storedSession,
              isAuthenticated: true,
              isLoading: false,
              loading: false
            }));
            return;
          }
          
          // Otherwise check with Supabase
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          logger.debug("Session check:", data.session ? "Session found" : "No session");
          
          // If there's an active session from Supabase
          if (data.session) {
            setAuthState(prev => ({
              ...prev,
              user: data.session.user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              loading: false
            }));
            saveSession(data.session, remember);
          } else {
            // No session found
            setAuthState(prev => ({
              ...prev,
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              loading: false
            }));
            saveSession(null, false);
          }
        } catch (error) {
          logger.error("Error checking session:", error);
          
          setAuthState(prev => ({ 
            ...prev, 
            isLoading: false, 
            loading: false, 
            isAuthenticated: false,
            user: null,
            session: null
          }));
          
          toast({
            title: "Erro de autenticação",
            description: "Houve um problema ao verificar sua sessão. Por favor, tente novamente.",
            variant: "destructive"
          });
        }
      };
      
      initialCheck();
    }
    
    return () => {
      // Do not unsubscribe the global listener when individual components unmount
    };
  }, [setAuthState, loadStoredSession, saveSession, toast]);
  
  // Return the listener ref for external access
  return {
    authListener: authListenerRef.current,
    isInitialized: authListenerInitialized,
    resetListener: () => {
      if (globalAuthSubscription) {
        globalAuthSubscription.unsubscribe();
        globalAuthSubscription = null;
      }
      authListenerInitialized = false;
    }
  };
};
