
import { useSessionInit } from './useSessionInit';
import { useAuthLogout } from './useAuthLogout';
import { usePremiumStatus } from './usePremiumStatus';
import { useMemo } from 'react';

export const useAuthState = () => {
  // Obter estado da sessão
  const sessionState = useSessionInit();
  
  // Obter função de logout
  const logout = useAuthLogout();
  
  // Verificar status premium
  const isPremium = usePremiumStatus(sessionState.user);
  
  // Calcular se usuário está autenticado de forma memorizada para evitar rerenders
  const isFullyAuthenticated = useMemo(() => {
    return sessionState.isAuthenticated === true && !!sessionState.user;
  }, [sessionState.isAuthenticated, sessionState.user]);
  
  // Retornar valores combinados
  return {
    ...sessionState,
    logout,
    isPremium,
    isFullyAuthenticated
  };
};
