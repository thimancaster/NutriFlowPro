
import { Toaster } from "@/components/ui/toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { PatientProvider } from "@/contexts/patient/PatientContext";
import { ConsultationDataProvider } from "@/contexts/ConsultationDataContext";
import { GlobalPatientProvider } from "@/contexts/GlobalPatientProvider";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import Consultation from "./pages/Consultation";
import Calculator from "./pages/Calculator";
import Clinical from "./pages/Clinical";
import MealPlans from "./pages/MealPlans";
import MealPlanWorkflowPage from "./pages/MealPlanWorkflowPage";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <GlobalPatientProvider>
            <PatientProvider>
              <ConsultationDataProvider>
                <MealPlanProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/pricing" element={<Pricing />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
                    <Route path="/patient/:id" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
                    <Route path="/consultation/:id?" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
                    <Route path="/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
                    <Route path="/clinical" element={<ProtectedRoute><Clinical /></ProtectedRoute>} />
                    <Route path="/meal-plans" element={<ProtectedRoute><MealPlans /></ProtectedRoute>} />
                    <Route path="/meal-plan-workflow" element={<ProtectedRoute><MealPlanWorkflowPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    
                    {/* Redirect any unknown routes to dashboard for authenticated users */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MealPlanProvider>
              </ConsultationDataProvider>
            </PatientProvider>
          </GlobalPatientProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
