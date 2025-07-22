
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requirePremium = false 
}) => {
  const { user, loading, isPremium } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to pricing if premium required but user is not premium
  if (requirePremium && !isPremium) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
