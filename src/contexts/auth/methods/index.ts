
import { ToastProps } from '@/hooks/toast/toast-types';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';
import { useCallback } from 'react';
// Update the import from the correct location
import { usePremiumCheck } from '@/hooks/premium';
import { login, signInWithGoogle } from './loginMethods';
import { signup } from './signupMethods';
import { logout } from './logoutMethod';
import { resetPassword } from './passwordMethods';

// Export the authentication methods for direct import
export { login, signInWithGoogle } from './loginMethods';
export { signup } from './signupMethods';
export { logout } from './logoutMethod';
export { resetPassword } from './passwordMethods';

export const useAuthMethods = (
  updateAuthState: (session: any, remember?: boolean) => Promise<void>,
  toast: (props: ToastProps) => any,
  queryClient: ReturnType<typeof useQueryClient>
) => {
  const { checkPremiumStatus } = usePremiumCheck();

  // We wrap the imported methods to provide them with the necessary context
  const handleLogin = useCallback(async (email: string, password: string, remember: boolean = false) => {
    const result = await login(email, password, remember, 
      (props) => toast(props));
    
    // If login was successful, update auth state with the remember me preference
    if (result.success && result.session) {
      await updateAuthState(result.session, remember);
    }
    
    return result;
  }, [toast, updateAuthState]);

  const handleSignup = useCallback(async (email: string, password: string, name: string) => {
    return await signup(email, password, name, 
      (props) => toast(props));
  }, [toast]);

  const handleLogout = useCallback(async () => {
    return await logout(
      (props) => toast(props), 
      queryClient, 
      updateAuthState);
  }, [toast, queryClient, updateAuthState]);

  const handleResetPassword = useCallback(async (email: string) => {
    return await resetPassword(email, 
      (props) => toast(props));
  }, [toast]);

  const handleSignInWithGoogle = useCallback(async () => {
    return await signInWithGoogle(
      (props) => toast(props));
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
