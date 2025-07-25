
import React, { createContext, useContext } from 'react';
import { AuthContextType } from './types';
import { useAuthStateManager } from './useAuthStateManager';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { login, signup, logout, resetPassword, signInWithGoogle } from './methods';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authState, updateAuthState } = useAuthStateManager();

  // Implement auth methods with real logic
  const handleLogin = async (email: string, password: string, remember: boolean = false) => {
    try {
      const result = await login(email, password, remember, toast);
      
      if (result.success && result.data) {
        await updateAuthState(result.data.session, remember);
      }
      
      return result;
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    return await signup(email, password, name, toast);
  };

  const handleLogout = async () => {
    return await logout(toast, queryClient, updateAuthState);
  };

  const handleResetPassword = async (email: string) => {
    return await resetPassword(email, toast);
  };

  const handleSignInWithGoogle = async () => {
    return await signInWithGoogle(toast);
  };

  const value: AuthContextType = {
    user: authState.user,
    session: authState.session,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    loading: authState.loading,
    isPremium: authState.isPremium,
    userTier: authState.userTier as 'free' | 'premium',
    usageQuota: authState.usageQuota,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    resetPassword: handleResetPassword,
    signInWithGoogle: handleSignInWithGoogle,
    updateAuthState
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
