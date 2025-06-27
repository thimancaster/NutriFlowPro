
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { PatientProvider } from "@/contexts/patient/PatientContext";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import AppRoutes from "@/routes";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="nutriflow-theme">
        <BrowserRouter>
          <AuthProvider>
            <PatientProvider>
              <SecurityProvider>
                <AppRoutes />
                <Toaster />
              </SecurityProvider>
            </PatientProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
