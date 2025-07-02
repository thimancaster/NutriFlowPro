
import { Toaster } from "@/components/ui/sonner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { PatientProvider } from "./contexts/patient/PatientContext";
import { ConsultationProvider } from "./contexts/ConsultationContext";
import { MealPlanWorkflowProvider } from "./contexts/MealPlanWorkflowContext";
import SystemHealthMonitor from "./components/system/SystemHealthMonitor";
import AppRoutes from "./routes";

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
                <AppRoutes />
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
