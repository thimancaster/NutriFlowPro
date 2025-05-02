
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  // Additional verification of authentication status
  useEffect(() => {
    const verifySession = async () => {
      if (isLoading) return;
      
      if (!isAuthenticated) {
        setIsVerifying(false);
        return;
      }
      
      try {
        console.log("Verificando sessão do usuário:", user?.email);
        // Double-check session validity with Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          navigate('/', { replace: true });
          return;
        }
        
        if (!data.session) {
          console.warn("Nenhuma sessão válida encontrada");
          navigate('/', { replace: true });
          return;
        }
        
        // Verify token expiration
        const expiresAt = data.session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresAt && expiresAt < now) {
          console.warn("Token expirado, fazendo logout");
          await supabase.auth.signOut();
          navigate('/', { replace: true });
          return;
        }
        
        console.log("Sessão verificada com sucesso");
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        navigate('/', { replace: true });
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifySession();
  }, [isAuthenticated, isLoading, navigate, user?.email]);

  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-nutri-green" />
          <p className="mt-4 text-nutri-blue">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para página inicial");
    return <Navigate to="/" replace />;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {children}
    </main>
  );
};

export default ProtectedRoute;
