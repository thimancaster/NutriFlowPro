
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Importar o GlobalErrorBoundary
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';

// Import our new utility functions
import { initSentry } from './utils/sentry';
import { logger } from './utils/logger';

// Initialize Sentry for error tracking
initSentry();

// Log application startup
logger.info('Application starting', { 
  context: 'Startup',
  details: { 
    environment: import.meta.env.MODE,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0'
  }
});

// Add global error handler (estes listeners continuarão a capturar erros globais,
// mas o ErrorBoundary React lida com erros na árvore de componentes React)
window.addEventListener('error', (event) => {
  logger.error('Uncaught error (from window.onerror)', {
    context: 'Global',
    details: {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection (from window.onunhandledrejection)', {
    context: 'Global',
    details: {
      reason: event.reason
    }
  });
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* Envolver o componente App com o GlobalErrorBoundary */}
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
);
