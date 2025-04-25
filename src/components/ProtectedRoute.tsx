
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from './Navbar';
import UserInfoHeader from './UserInfoHeader';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };

    checkAuth();
  }, []);

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
    <div>
      <Navbar />
      <UserInfoHeader />
      <Outlet />
    </div>
  );
};

export default ProtectedRoute;
