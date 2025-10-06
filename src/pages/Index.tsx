
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '@/components/LandingPage';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Effect to redirect authenticated users to dashboard
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-nutri-blue" />
        <p className="mt-4 text-nutri-blue font-medium">Carregando...</p>
      </div>
    );
  }
  
  // For unauthenticated users, show the landing page
  return (
    <>
      <Helmet>
        <title>NutriFlow Pro - Sistema para Nutricionistas</title>
      </Helmet>
      <LandingPage />
    </>
  );
};

export default Index;
