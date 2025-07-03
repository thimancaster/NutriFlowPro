
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { PatientProvider } from "./contexts/patient/PatientContext";
import { ConsultationProvider } from "./contexts/ConsultationContext";
import { MealPlanWorkflowProvider } from "./contexts/MealPlanWorkflowContext";
import { ThemeProvider } from "./components/theme-provider";
import SystemHealthMonitor from "./components/system/SystemHealthMonitor";
import AppRoutes from "./routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
