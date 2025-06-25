
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { ConsultationProvider } from "@/contexts/ConsultationContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Calculator from "@/pages/Calculator";
import Patients from "@/pages/Patients";
import MealPlanGenerator from "@/pages/MealPlanGenerator";
import Settings from "@/pages/Settings";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthHandler from "@/components/auth/AuthHandler";
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
            <SecurityProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/auth" element={<AuthHandler />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ConsultationProvider>
                        <Dashboard />
                      </ConsultationProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calculator"
                  element={
                    <ProtectedRoute>
                      <ConsultationProvider>
                        <Calculator />
                      </ConsultationProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patients/*"
                  element={
                    <ProtectedRoute>
                      <ConsultationProvider>
                        <Patients />
                      </ConsultationProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meal-plan-generator"
                  element={
                    <ProtectedRoute>
                      <ConsultationProvider>
                        <MealPlanGenerator />
                      </ConsultationProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Toaster />
            </SecurityProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
