
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import Navbar from './Navbar';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthState();

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Redirect to login if not authenticated
  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  // Show the protected content if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedRoute;
