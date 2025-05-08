
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';
import { useCallback } from 'react';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
import { login, signInWithGoogle } from './methods/loginMethods';
import { signup } from './methods/signupMethods';
import { logout } from './methods/logoutMethod';
import { resetPassword } from './methods/passwordMethods';

export const useAuthMethods = (
  updateAuthState: (session: any) => Promise<void>,
  toast: ReturnType<typeof useToast>['toast'],
  queryClient: ReturnType<typeof useQueryClient>
) => {
  const { checkPremiumStatus } = usePremiumCheck();

  // We wrap the imported methods to provide them with the necessary context
  const handleLogin = useCallback(async (email: string, password: string) => {
    return await login(email, password, toast);
  }, [toast]);

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
