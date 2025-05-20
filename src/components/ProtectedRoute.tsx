
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { AUTH_CONSTANTS } from '@/constants/authConstants';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresPremium?: boolean;
}

const ProtectedRoute = ({ children, requiresPremium = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isPremium } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  
  // Use effect for session verification with timeout protection
  useEffect(() => {
    let timeoutId: number | undefined;

    // Set a timeout to prevent infinite loading
    timeoutId = window.setTimeout(() => {
      if (isVerifying && verificationAttempts >= AUTH_CONSTANTS.MAX_VERIFICATION_ATTEMPTS) {
        console.error("Session verification timed out");
        setIsVerifying(false);
      }
    }, AUTH_CONSTANTS.VERIFICATION_TIMEOUT);

    const verifySession = async () => {
      // Skip verification if we already know the status
      if (isLoading === false) {
        setIsVerifying(false);
        return;
      }
      
      try {
        setVerificationAttempts(prev => prev + 1);
        console.log("Verificando sessão do usuário. Tentativa:", verificationAttempts + 1);
        
        // If we've reached max attempts but auth is still loading, stop verification
        if (verificationAttempts >= AUTH_CONSTANTS.MAX_VERIFICATION_ATTEMPTS) {
          console.error("Maximum verification attempts reached");
          setIsVerifying(false);
          return;
        }
        
        // Set verification complete once auth is no longer loading
        if (!isLoading) {
          console.log("Sessão verificada com sucesso");
          setIsVerifying(false);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        setIsVerifying(false);
      }
    };
    
    // Only verify if we're still loading or verifying
    if (isLoading || isVerifying) {
      verifySession();
    }
    
    return () => {
      // Clear timeout on cleanup
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, isLoading, verificationAttempts, isVerifying]);

  // Show loading state until verification completes
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-nutri-green" />
          <p className="mt-4 text-nutri-blue">Verificando autenticação...</p>
          {verificationAttempts > 1 && (
            <p className="mt-2 text-sm text-gray-500">
              Tentativa {verificationAttempts} de {AUTH_CONSTANTS.MAX_VERIFICATION_ATTEMPTS}...
            </p>
          )}
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires premium but user is not premium, redirect to subscription
  if (requiresPremium && !isPremium) {
    console.log("Premium route access denied, redirecting to subscription page");
    return <Navigate to="/subscription" state={{ 
      referrer: location.pathname,
      reason: 'premium-required' 
    }} replace />;
  }

  // If authenticated and meets premium requirements (if any), render children
  return <>{children}</>;
};

export default ProtectedRoute;
