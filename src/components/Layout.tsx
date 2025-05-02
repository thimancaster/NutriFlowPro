
import React, { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen">
      <ProtectedRoute>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </ProtectedRoute>
    </div>
  );
};

export default Layout;
