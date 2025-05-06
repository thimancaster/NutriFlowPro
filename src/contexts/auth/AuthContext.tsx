
import React, { createContext, useContext } from 'react';
import { AuthContextType } from './types';
import { useAuthStateManager } from './useAuthStateManager';
import { useAuthMethods } from './authMethods';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState, updateAuthState, toast, queryClient } = useAuthStateManager();
  const { checkPremiumStatus, login, signup, logout, resetPassword, signInWithGoogle } = useAuthMethods(updateAuthState, toast, queryClient);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
