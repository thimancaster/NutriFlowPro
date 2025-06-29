
import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppointmentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Appointment Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro no Sistema de Agendamentos</AlertTitle>
          <AlertDescription className="mt-2">
            <p>Ocorreu um erro inesperado no sistema de agendamentos.</p>
            {this.state.error && (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer">Detalhes do erro</summary>
                <pre className="mt-1 whitespace-pre-wrap">{this.state.error.message}</pre>
              </details>
            )}
            <Button 
              onClick={this.handleRetry} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default AppointmentErrorBoundary;
