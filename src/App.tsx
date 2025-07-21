
import { Toaster } from "@/components/ui/toaster";
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
import PrivateRoute from "./components/auth/PrivateRoute";

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
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
                    <Route path="/patient/:id" element={<PrivateRoute><PatientProfile /></PrivateRoute>} />
                    <Route path="/consultation/:id?" element={<PrivateRoute><Consultation /></PrivateRoute>} />
                    <Route path="/calculator" element={<PrivateRoute><Calculator /></PrivateRoute>} />
                    <Route path="/clinical" element={<PrivateRoute><Clinical /></PrivateRoute>} />
                    <Route path="/meal-plans" element={<PrivateRoute><MealPlans /></PrivateRoute>} />
                    <Route path="/meal-plan-workflow" element={<PrivateRoute><MealPlanWorkflowPage /></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                    
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
