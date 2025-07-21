
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { PatientProvider } from "@/contexts/patient/PatientContext";
import { ConsultationDataProvider } from "@/contexts/ConsultationDataContext";
import { GlobalPatientProvider } from "@/contexts/GlobalPatientProvider";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import AppRoutes from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
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
                  <AppRoutes />
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
