
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { PatientProvider } from '@/contexts/patient/PatientContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { Toaster } from 'sonner';
import { Helmet } from 'react-helmet';

// Pages
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import Calculator from '@/pages/Calculator';
import MealPlans from '@/pages/MealPlans';
import Appointments from '@/pages/Appointments';
import SettingsPage from '@/pages/SettingsPage';
import PlanilhaCalculator from '@/pages/PlanilhaCalculator';

// Layout Components
import Sidebar from '@/components/layout/Sidebar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PatientProvider>
            <MealPlanProvider>
              <Router>
                <Helmet>
                  <title>NutriFlow Pro - Sistema de Gestão Nutricional</title>
                  <meta name="description" content="Sistema completo para profissionais de nutrição" />
                </Helmet>
                <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                  <Sidebar />
                  <main className="flex-1 overflow-hidden">
                    <div className="h-full overflow-auto p-6">
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/patients" element={<Patients />} />
                        <Route path="/calculator" element={<Calculator />} />
                        <Route path="/planilha-calculator" element={<PlanilhaCalculator />} />
                        <Route path="/meal-plans" element={<MealPlans />} />
                        <Route path="/appointments" element={<Appointments />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Routes>
                    </div>
                  </main>
                </div>
                <Toaster />
              </Router>
            </MealPlanProvider>
          </PatientProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
