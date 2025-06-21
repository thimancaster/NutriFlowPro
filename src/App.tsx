
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/auth/AuthContext';
import { StrictMode } from 'react';
import { ThemeProvider } from "./components/theme-provider"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner"
import AppRoutes from './routes';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Router>
        <StrictMode>
          <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </StrictMode>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
