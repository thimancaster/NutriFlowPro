
import React, { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Additional verification of authentication status
  useEffect(() => {
    const verifySession = async () => {
      if (!isLoading && isAuthenticated) {
        try {
          // Double-check session validity with Supabase
          const { data, error } = await supabase.auth.getSession();
          
          if (error || !data.session) {
            console.error("Protected route session verification failed:", error || "No valid session");
            navigate('/login', { replace: true });
          }
        } catch (err) {
          console.error("Error verifying authentication:", err);
          navigate('/login', { replace: true });
        }
      }
    };
    
    verifySession();
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-nutri-green border-opacity-50"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {children}
    </main>
  );
};

export default ProtectedRoute;
