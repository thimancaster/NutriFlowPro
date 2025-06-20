
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
import AppointmentsPage from './pages/AppointmentsPage';
import SettingsPage from './pages/SettingsPage';
import { StrictMode } from 'react';
import { ThemeProvider } from "./components/theme-provider"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner"
import AdvancedFeatures from '@/pages/AdvancedFeatures';
import { PatientProvider } from '@/contexts/patient/PatientContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { ConsultationProvider } from '@/contexts/ConsultationContext';
import { ConsultationDataProvider } from '@/contexts/ConsultationDataContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Wrapper para rotas protegidas com todos os providers necessários
const ProtectedWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <PatientProvider>
        <MealPlanProvider>
          <ConsultationDataProvider>
            <ConsultationProvider>
              {children}
            </ConsultationProvider>
          </ConsultationDataProvider>
        </MealPlanProvider>
      </PatientProvider>
    </ProtectedRoute>
  );
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
                    <ProtectedWrapper>
                      <Dashboard />
                    </ProtectedWrapper>
                  } 
                />
                <Route 
                  path="/patients" 
                  element={
                    <ProtectedWrapper>
                      <Patients />
                    </ProtectedWrapper>
                  } 
                />
                <Route 
                  path="/calculator" 
                  element={
                    <ProtectedWrapper>
                      <Calculator />
                    </ProtectedWrapper>
                  } 
                />
                <Route 
                  path="/meal-plan-generator" 
                  element={
                    <ProtectedWrapper>
                      <MealPlanGenerator />
                    </ProtectedWrapper>
                  } 
                />
                <Route 
                  path="/consultation/:id?" 
                  element={
                    <ProtectedWrapper>
                      <Consultation />
                    </ProtectedWrapper>
                  } 
                />
                <Route 
                  path="/clinical" 
                  element={
                    <ProtectedWrapper>
                      <Clinical />
                    </ProtectedWrapper>
                  } 
                />
                <Route 
                  path="/appointments" 
                  element={
                    <ProtectedWrapper>
                      <AppointmentsPage />
                    </ProtectedWrapper>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedWrapper>
                      <SettingsPage />
                    </ProtectedWrapper>
                  } 
                />
                <Route 
                  path="/advanced-features" 
                  element={
                    <ProtectedWrapper>
                      <AdvancedFeatures />
                    </ProtectedWrapper>
                  } 
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
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
