
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import Patients from "./pages/Patients";
import MealPlans from "./pages/MealPlans";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import Consultation from "./pages/Consultation";
import MealPlanGenerator from "./pages/MealPlanGenerator";
import PatientHistory from "./pages/PatientHistory";
import PatientAnthropometry from "./pages/PatientAnthropometry";
import Recursos from "./pages/Recursos";
import AddTestimonial from "./pages/AddTestimonial";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import { useEffect } from "react";
import { seedTestimonials } from "./utils/seedTestimonials";

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Seed testimonials on app initialization
  useEffect(() => {
    seedTestimonials();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - login, cadastro, recuperação de senha e página inicial */}
            <Route path="/" element={<Index />} /> {/* Index will conditionally render LandingPage or Dashboard */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/recursos" element={<Recursos />} />
            
            {/* Protected Routes - Todas as funcionalidades do sistema requerem autenticação */}
            <Route element={<ProtectedRoute />}>
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/meal-plans" element={<MealPlans />} />
              <Route path="/add-testimonial" element={<AddTestimonial />} />
              <Route path="/subscription" element={<Subscription />} />
              
              {/* Patient and Consultation Routes */}
              <Route path="/patient-history/:patientId" element={<PatientHistory />} />
              <Route path="/patient-anthropometry/:patientId" element={<PatientAnthropometry />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
              <Route path="/meal-plan/:consultationId" element={<Index />} /> {/* Placeholder */}
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Redirecionar qualquer rota desconhecida para login se não autenticado */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
