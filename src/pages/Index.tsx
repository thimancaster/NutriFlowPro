
import React from 'react';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';
import { useAuthState } from '@/hooks/useAuthState';

const Index = () => {
  const { isAuthenticated, user } = useAuthState();
  
  // If authenticated, show Dashboard, otherwise show LandingPage
  return isAuthenticated ? <Dashboard /> : <LandingPage />;
};

export default Index;
