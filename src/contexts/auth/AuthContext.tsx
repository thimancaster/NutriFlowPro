
import React, { createContext, useContext } from 'react';
import { AuthContextType } from './types';
import useAuthStateManager from '@/hooks/auth/useAuthStateManager';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuthStateManager();

  // Create auth methods (placeholders, real implementation would be in separate hooks)
  const login = async (email: string, password: string) => {
    // Implementation would be provided in a separate hook
    console.log('Login method called', email);
    return { success: false, error: new Error('Not implemented') };
  };

  const signup = async (email: string, password: string, name?: string) => {
    // Implementation would be provided in a separate hook
    console.log('Signup method called', email, name);
    return { success: false, error: new Error('Not implemented') };
  };

  const logout = async () => {
    // Implementation would be provided in a separate hook
    console.log('Logout method called');
    return { success: false, error: new Error('Not implemented') };
  };

  const resetPassword = async (email: string) => {
    // Implementation would be provided in a separate hook
    console.log('Reset password method called', email);
    return { success: false, error: new Error('Not implemented') };
  };

  const signInWithGoogle = async () => {
    // Implementation would be provided in a separate hook
    console.log('Sign in with Google method called');
    return { success: false, error: new Error('Not implemented') };
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
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle
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
