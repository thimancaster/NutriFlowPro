import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ClinicalWorkflowProvider } from '@/contexts/ClinicalWorkflowContext';
import AppRoutes from '@/routes';
import { Toaster } from '@/components/ui/sonner';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';

/**
 * Componente raiz da aplicação.
 * Responsável por configurar os provedores de contexto globais e o sistema de rotas.
 */
function App() {
  return (
    <GlobalErrorBoundary>
      <Router>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AuthProvider>
            {/* O ClinicalWorkflowProvider gerencia a sessão clínica ativa */}
            <ClinicalWorkflowProvider>
              <AppRoutes />
            </ClinicalWorkflowProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </Router>
    </GlobalErrorBoundary>
  );
}

export default App;
