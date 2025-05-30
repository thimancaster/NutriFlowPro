
import React, { Component, ErrorInfo, ReactNode } from 'react';
import GlobalErrorBoundary from './error/GlobalErrorBoundary';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <GlobalErrorBoundary>
          {this.props.children}
        </GlobalErrorBoundary>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
