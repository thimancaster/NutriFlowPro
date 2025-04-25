import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUserSubscription } from "@/hooks/useUserSubscription";
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

const App = () => {
  const { data: subscription } = useUserSubscription();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/subscription" element={<Subscription />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Index />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/meal-plans" element={<MealPlans />} />
            <Route path="/recursos" element={<Recursos />} />
            <Route path="/add-testimonial" element={<AddTestimonial />} />
            
            {/* Patient and Consultation Routes */}
            <Route path="/patient-history/:patientId" element={<PatientHistory />} />
            <Route path="/patient-anthropometry/:patientId" element={<PatientAnthropometry />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route 
              path="/meal-plan-generator" 
              element={subscription?.isPremium ? <MealPlanGenerator /> : <div>Upgrade Required</div>} 
            />
            <Route path="/meal-plan/:consultationId" element={<Index />} /> {/* Placeholder */}
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
