
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-center mb-4">Algo deu errado</h1>
            <div className="bg-gray-100 p-3 rounded mb-4 overflow-auto max-h-40">
              <p className="text-sm font-mono text-red-600">
                {this.state.error?.message || 'Erro desconhecido'}
              </p>
            </div>
            <p className="text-gray-600 mb-6 text-center">
              Pedimos desculpas pelo inconveniente. Por favor, tente atualizar a página ou contate o suporte se o problema persistir.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-nutri-blue text-white px-4 py-2 rounded hover:bg-nutri-blue-dark transition-colors"
              >
                Atualizar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
