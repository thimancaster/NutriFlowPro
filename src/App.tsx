import React, { Suspense } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Patients from './pages/Patients';
import PatientHistory from './pages/PatientHistory';
import Consultation from './pages/Consultation';
import MealPlanGenerator from './pages/MealPlanGenerator';
import Subscription from './pages/Subscription';
import Pricing from './pages/Pricing';
import Calculator from './pages/Calculator';
import MealPlans from './pages/MealPlans';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from './contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

// Add import for the ConsultationProvider
import { ConsultationProvider } from './contexts/ConsultationContext';

const queryClient = new QueryClient();

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Skeleton className="w-20 h-20 rounded-full animate-pulse" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    
    <HashRouter>
      <AuthProvider>
        <ConsultationProvider>
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/patients" element={
                  <ProtectedRoute>
                    <Patients />
                  </ProtectedRoute>
                } />
                <Route path="/patient-history/:patientId" element={
                  <ProtectedRoute>
                    <PatientHistory />
                  </ProtectedRoute>
                } />
                <Route path="/consultation" element={
                  <ProtectedRoute>
                    <Consultation />
                  </ProtectedRoute>
                } />
                <Route path="/meal-plan-generator" element={
                  <ProtectedRoute>
                    <MealPlanGenerator />
                  </ProtectedRoute>
                } />
                <Route path="/subscription" element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                } />
                <Route path="/pricing" element={
                  <ProtectedRoute>
                    <Pricing />
                  </ProtectedRoute>
                } />
                <Route path="/calculator" element={
                  <ProtectedRoute>
                    <Calculator />
                  </ProtectedRoute>
                } />
                <Route path="/meal-plans" element={
                  <ProtectedRoute>
                    <MealPlans />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* Redirect any unknown route to the homepage */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ErrorBoundary>
            <Toaster />
          </QueryClientProvider>
        </ConsultationProvider>
      </AuthProvider>
    </HashRouter>
    
  );
}

export default App;
