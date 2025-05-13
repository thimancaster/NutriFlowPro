
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { AUTH_CONSTANTS } from '@/constants/authConstants';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresPremium?: boolean;
}

const ProtectedRoute = ({ children, requiresPremium = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  
  // Use effect for session verification with timeout protection
  useEffect(() => {
    let isMounted = true;
    let timeoutId: number | undefined;

    // Set a timeout to prevent infinite loading
    timeoutId = window.setTimeout(() => {
      if (isMounted && isVerifying && verificationAttempts >= AUTH_CONSTANTS.MAX_VERIFICATION_ATTEMPTS) {
        console.error("Session verification timed out");
        setIsVerifying(false);
        // Force navigate to login if verification is taking too long
        navigate('/', { replace: true });
      }
    }, AUTH_CONSTANTS.VERIFICATION_TIMEOUT); // 5 seconds timeout

    const verifySession = async () => {
      // Skip verification if we already know the status
      if (isLoading === false) {
        if (!isAuthenticated) {
          setIsVerifying(false);
          return;
        }
        
        // If route requires premium and user is not premium, redirect
        if (requiresPremium && !isPremium) {
          console.log("Premium route access denied, redirecting to subscription page");
          navigate('/subscription', { 
            state: { 
              referrer: window.location.pathname,
              reason: 'premium-required' 
            } 
          });
          return;
        }
        
        setIsVerifying(false);
        return;
      }
      
      try {
        setVerificationAttempts(prev => prev + 1);
        console.log("Verificando sessão do usuário:", user?.email, "Tentativa:", verificationAttempts + 1);
        
        // If we've reached max attempts but auth is still loading, force navigate to login
        if (verificationAttempts >= AUTH_CONSTANTS.MAX_VERIFICATION_ATTEMPTS) {
          console.error("Maximum verification attempts reached");
          if (isMounted) {
            setIsVerifying(false);
            navigate('/', { replace: true });
          }
          return;
        }
        
        // Set verification complete once auth is no longer loading
        if (!isLoading) {
          if (isMounted) {
            console.log("Sessão verificada com sucesso");
            setIsVerifying(false);
          }
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        if (isMounted) {
          setIsVerifying(false);
          navigate('/', { replace: true });
        }
      }
    };
    
    // Only verify if we're still loading or verifying
    if (isLoading || isVerifying) {
      verifySession();
    }
    
    return () => {
      isMounted = false;
      // Clear timeout on cleanup
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, isLoading, navigate, user?.email, isPremium, requiresPremium, isVerifying, verificationAttempts]);

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

  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para página inicial");
    return <Navigate to="/" replace />;
  }

  // If authenticated and meets premium requirements (if any), render children
  return (
    <main className="container mx-auto px-4 py-8">
      {children}
    </main>
  );
};

export default ProtectedRoute;
