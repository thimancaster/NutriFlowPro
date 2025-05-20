
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import LoginForm from '@/components/auth/LoginForm';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, signInWithGoogle } = useAuth();
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  // Show loading while authentication is being checked
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <AuthLayout>
      <AuthHeader 
        title="NutriFlow Pro" 
        subtitle="Sistema completo para nutricionistas" 
      />

      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 max-w-md w-full mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Login</h2>
        <LoginForm onGoogleLogin={signInWithGoogle} />
      </div>
    </AuthLayout>
  );
};

export default Login;
