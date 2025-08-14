import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { Calculator } from '@/pages/Calculator';
import { Consultations } from '@/pages/Consultations';
import { MealPlans } from '@/pages/MealPlans';
import { Appointments } from '@/pages/Appointments';
import { Reports } from '@/pages/Reports';
import { SettingsPage } from '@/pages/SettingsPage';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { PatientProvider } from '@/contexts/patient/PatientContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalculatorProvider } from '@/contexts/calculator/CalculatorContext';
import PlanilhaCalculator from '@/pages/PlanilhaCalculator';

function App() {
  const queryClient = new QueryClient();

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PatientProvider>
            <CalculatorProvider>
              <Toaster />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/patients" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Patients />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/calculator" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Calculator />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/planilha-calculator" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PlanilhaCalculator />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/consultations" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Consultations />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/meal-plans" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MealPlans />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Appointments />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Reports />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SettingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </CalculatorProvider>
          </PatientProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
