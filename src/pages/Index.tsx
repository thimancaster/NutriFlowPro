
import React from 'react';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-nutri-blue" />
        <p className="mt-4 text-nutri-blue font-medium">Carregando...</p>
      </div>
    );
  }
  
  // If authenticated, show Dashboard, otherwise show LandingPage
  return isAuthenticated ? <Dashboard /> : <LandingPage />;
};

export default Index;
