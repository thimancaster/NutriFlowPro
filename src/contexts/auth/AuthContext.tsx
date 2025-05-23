
import React, { createContext, useContext } from 'react';
import { AuthContextType } from './types';
import useAuthStateManager from './useAuthStateManager';
import { login, signup, logout, resetPassword, signInWithGoogle } from './methods';
import { useToast } from '@/hooks/toast';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authState, updateAuthState } = useAuthStateManager();

  // Implement auth methods with real logic
  const handleLogin = async (email: string, password: string, remember: boolean = false) => {
    try {
      const result = await login(email, password, remember, 
        (props) => toast(props));
      
      if (result.success && result.session) {
        await updateAuthState(result.session, remember);
      }
      
      return result;
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    return await signup(email, password, name, 
      (props) => toast(props));
  };

  const handleLogout = async () => {
    return await logout(
      (props) => toast(props), 
      queryClient, 
      updateAuthState);
  };

  const handleResetPassword = async (email: string) => {
    return await resetPassword(email, 
      (props) => toast(props));
  };

  const handleSignInWithGoogle = async () => {
    return await signInWithGoogle(
      (props) => toast(props));
  };

  const value: AuthContextType = {
    user: authState.user,
    session: authState.session,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    loading: authState.loading,
    isPremium: authState.isPremium,
    userTier: authState.userTier,
    usageQuota: authState.usageQuota,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    resetPassword: handleResetPassword,
    signInWithGoogle: handleSignInWithGoogle,
    updateAuthState // Expose this function for AuthHandler
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
