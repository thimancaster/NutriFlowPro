
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Apple } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import LoginForm from '@/components/auth/LoginForm';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, signInWithGoogle } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Show loading while authentication is being checked
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <AuthLayout>
      <AuthHeader 
        title="NutriFlow Pro" 
        subtitle="Sistema completo para nutricionistas" 
      />

      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Login</h2>
        <LoginForm onGoogleLogin={signInWithGoogle} />
      </div>
    </AuthLayout>
  );
};

export default Login;
