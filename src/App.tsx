import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Calculator from './pages/Calculator';
import MealPlanGenerator from './pages/MealPlanGenerator';
import Consultation from './pages/Consultation';
import Clinical from './pages/Clinical';
import { StrictMode } from 'react';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"
import AdvancedFeatures from '@/pages/AdvancedFeatures';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Router>
        <StrictMode>
          <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/patients" 
                  element={
                    <ProtectedRoute>
                      <Patients />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/calculator" 
                  element={
                    <ProtectedRoute>
                      <Calculator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/meal-plan-generator" 
                  element={
                    <ProtectedRoute>
                      <MealPlanGenerator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/consultation/:id?" 
                  element={
                    <ProtectedRoute>
                      <Consultation />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/clinical" 
                  element={
                    <ProtectedRoute>
                      <Clinical />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route 
                  path="/advanced-features" 
                  element={
                    <ProtectedRoute>
                      <AdvancedFeatures />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </StrictMode>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
