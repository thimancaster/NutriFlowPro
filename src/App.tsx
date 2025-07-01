
import { Toaster } from "@/components/ui/toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { PatientProvider } from "./contexts/patient/PatientContext";
import { ConsultationProvider } from "./contexts/ConsultationContext";
import { MealPlanWorkflowProvider } from "./contexts/MealPlanWorkflowContext";
import SystemHealthMonitor from "./components/system/SystemHealthMonitor";
import Index from "./pages/Index";
import SystemDebug from "./pages/SystemDebug";
import Patients from "./pages/Patients";
import ClinicalWorkflow from "./components/clinical/ClinicalWorkflow";
import CalculatorTool from "./components/calculator/CalculatorTool";
import MealPlanWorkflow from "./components/MealPlanWorkflow/MealPlanWorkflow";
import Consultation from "./pages/Consultation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PatientProvider>
            <ConsultationProvider>
              <MealPlanWorkflowProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/system-debug" element={<SystemDebug />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/clinical-workflow/:patientId/:appointmentId?" element={<ClinicalWorkflow />} />
                  <Route path="/calculator" element={<CalculatorTool />} />
                  <Route path="/meal-plan-generator" element={<MealPlanWorkflow />} />
                  <Route path="/consultation/:consultationId?" element={<Consultation />} />
                </Routes>
                <SystemHealthMonitor />
              </MealPlanWorkflowProvider>
            </ConsultationProvider>
          </PatientProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
