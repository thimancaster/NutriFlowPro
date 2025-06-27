
import React from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { usePatient } from "@/contexts/patient/PatientContext";
import Navbar from "@/components/Navbar";

// Import our components
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { ThemeProvider } from "@/hooks/theme/use-theme-provider";
import { TourGuide } from "@/components/tour-guide/TourGuide";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activePatient, sessionData } = usePatient();

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <TourGuide />

        {/* Header with Navbar */}
        <Navbar />

        {/* Active Patient Indicator */}
        {activePatient && sessionData.consultationActive && (
          <div className="bg-nutri-green text-white px-4 py-2 text-sm">
            <div className="container mx-auto flex items-center justify-between">
              <span>
                🩺 Atendimento ativo: <strong>{activePatient.name}</strong>
              </span>
              <span className="text-xs opacity-75">
                Etapa: {sessionData.currentStep}
              </span>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-6">
            <BreadcrumbNav />
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} NutriFlow Pro. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
