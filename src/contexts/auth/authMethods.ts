import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';
import { useCallback } from 'react';
// Update the import from the correct location
import { usePremiumCheck } from '@/hooks/premium';
import { login, signInWithGoogle } from './methods/loginMethods';
import { signup } from './methods/signupMethods';
import { logout } from './methods/logoutMethod';
import { resetPassword } from './methods/passwordMethods';
import { auditLogService } from '@/services/auditLogService';

export const useAuthMethods = (
  updateAuthState: (session: any, remember?: boolean) => Promise<void>,
  toast: ReturnType<typeof useToast>['toast'],
  queryClient: ReturnType<typeof useQueryClient>
) => {
  const { checkPremiumStatus } = usePremiumCheck();

  // We wrap the imported methods to provide them with the necessary context
  const handleLogin = useCallback(async (email: string, password: string, remember: boolean = false) => {
    const result = await login(email, password, remember, toast);
    
    // If login was successful, update auth state with the remember me preference
    if (result.success && result.session) {
      await updateAuthState(result.session, remember);
    }
    
    return result;
  }, [toast, updateAuthState]);

  const handleSignup = useCallback(async (email: string, password: string, name: string) => {
    return await signup(email, password, name, toast);
  }, [toast]);

  const handleLogout = useCallback(async () => {
    return await logout(toast, queryClient, updateAuthState);
  }, [toast, queryClient, updateAuthState]);

  const handleResetPassword = useCallback(async (email: string) => {
    return await resetPassword(email, toast);
  }, [toast]);

  const handleSignInWithGoogle = useCallback(async () => {
    return await signInWithGoogle(toast);
  }, [toast]);

  return {
    checkPremiumStatus,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    resetPassword: handleResetPassword,
    signInWithGoogle: handleSignInWithGoogle
  };
};

export const enhanceAuthMethods = (existingMethods: any) => {
  return {
    ...existingMethods,
    
    // Override login to include audit logging
    login: async (email: string, password: string) => {
      try {
        const result = await existingMethods.login(email, password);
        
        if (result.success && result.user) {
          // Log successful login
          await auditLogService.logLoginAttempt(
            result.user.id,
            email,
            true
          );
        }
        
        return result;
      } catch (error: any) {
        // Log failed login attempt
        await auditLogService.logLoginAttempt(
          'unknown',
          email,
          false,
          error.message
        );
        throw error;
      }
    },
    
    // Override signup to include audit logging
    signup: async (email: string, password: string, metadata?: any) => {
      try {
        const result = await existingMethods.signup(email, password, metadata);
        
        if (result.success && result.user) {
          // Log successful signup
          await auditLogService.logEvent({
            user_id: result.user.id,
            event_type: 'user_signup',
            event_data: {
              email,
              timestamp: new Date().toISOString()
            }
          });
        }
        
        return result;
      } catch (error: any) {
        // Log failed signup attempt
        await auditLogService.logEvent({
          user_id: 'unknown',
          event_type: 'signup_failed',
          event_data: {
            email,
            error: error.message,
            timestamp: new Date().toISOString()
          }
        });
        throw error;
      }
    }
  };
};
