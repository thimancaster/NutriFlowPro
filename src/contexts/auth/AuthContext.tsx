
import React, { createContext, useContext } from 'react';
import { AuthContextType } from './types';
import useAuthStateManager from '@/hooks/auth/useAuthStateManager';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuthStateManager();

  const value: AuthContextType = {
    user: authState.user,
    session: authState.session,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    loading: authState.loading,
    isPremium: authState.isPremium,
    userTier: authState.userTier,
    usageQuota: authState.usageQuota
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
