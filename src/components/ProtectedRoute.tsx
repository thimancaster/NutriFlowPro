
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from './Navbar';
import UserInfoHeader from './UserInfoHeader';

const ProtectedRoute = () => {
  const session = supabase.auth.getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Navbar />
      <UserInfoHeader />
      <Outlet />
    </div>
  );
};

export default ProtectedRoute;
