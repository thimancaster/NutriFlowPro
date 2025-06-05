
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { PatientProvider } from "./contexts/patient/PatientContext";
import { GlobalErrorBoundary } from "./components/error/GlobalErrorBoundary";
import SecurityMonitor from "./components/security/SecurityMonitor";
import Layout from "./components/Layout";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Patients from "./components/Patients";
import CalculatorTool from "./components/calculator/CalculatorTool";
import { MealPlanWorkflow } from "./components/MealPlanWorkflow/MealPlanWorkflow";
import ConsultationFormWrapper from "./components/Consultation/ConsultationFormWrapper";
import { ClinicalWorkflow } from "./components/clinical/ClinicalWorkflow";
import PatientHistory from "./components/PatientHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthHandler from "./components/auth/AuthHandler";
import { ProfileSettings } from "./components/Settings/ProfileSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <SecurityMonitor />
              <PatientProvider>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth/*" element={<AuthHandler />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/patients"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Patients />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/calculator"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <CalculatorTool />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/meal-plans"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <MealPlanWorkflow />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/consultations"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ConsultationFormWrapper />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clinical"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ClinicalWorkflow />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <PatientHistory />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ProfileSettings />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </PatientProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
