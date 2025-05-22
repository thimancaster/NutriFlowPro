
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { logger } from '@/utils/logger';

/**
 * AuthHandler component
 * Handles post-authentication redirects and URL cleaning
 * Used when returning from OAuth providers like Google
 */
const AuthHandler: React.FC = () => {
  const navigate = useNavigate();
  const { updateAuthState } = useAuth();

  useEffect(() => {
    // Check if there's an access_token in the URL (sign of OAuth redirect)
    const hasAuthParams = window.location.hash.includes('access_token') || 
                          window.location.search.includes('code=');
    
    if (hasAuthParams) {
      logger.info('Auth redirect detected, cleaning URL and processing session...');
      
      // Clean the URL by removing the hash
      window.history.replaceState(null, '', window.location.pathname);
      
      // Set up auth state change listener to catch the SIGNED_IN event
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        logger.debug(`Auth event in handler: ${event}`);
        
        if (event === 'SIGNED_IN' && session) {
          logger.info('User authenticated successfully');
          
          // Get remember me preference (or default to false)
          const rememberMe = localStorage.getItem('remember_me') === 'true';
          
          // Update auth state with the new session
          updateAuthState(session, rememberMe);
          
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        }
      });
      
      // Get the current session to check if we're already logged in
      const checkCurrentSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            logger.debug('Session already exists, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          logger.error('Error checking session:', error);
        }
      };
      
      checkCurrentSession();
      
      // Cleanup subscription when component unmounts
      return () => {
        data.subscription.unsubscribe();
      };
    } else {
      // If no auth params, redirect to login
      logger.debug('No auth parameters detected, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [navigate, updateAuthState]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="mt-4 text-lg font-medium text-gray-700">Autenticando...</p>
      <p className="mt-2 text-sm text-gray-500">Redirecionando para o dashboard...</p>
    </div>
  );
};

export default AuthHandler;
