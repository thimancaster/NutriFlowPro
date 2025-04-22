
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Main Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/meal-plans" element={<MealPlans />} />
          
          {/* Patient and Consultation Routes */}
          <Route path="/patient-history/:patientId" element={<PatientHistory />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
          <Route path="/meal-plan/:consultationId" element={<Index />} /> {/* Placeholder */}
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
