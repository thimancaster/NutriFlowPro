import React, { Suspense, lazy } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// HOC para lazy loading de componentes
export const withLazyLoading = <P extends Record<string, any> = {}>(
  importComponent: () => Promise<{ default: React.ComponentType<P> }>
) => {
  const LazyComponent = lazy(importComponent);
  
  return React.forwardRef<any, P>((props, ref) => (
    <LazyWrapper>
      <LazyComponent {...props} ref={ref} />
    </LazyWrapper>
  ));
};