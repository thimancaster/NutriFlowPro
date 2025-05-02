
import React, { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen">
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </div>
  );
};

export default Layout;
