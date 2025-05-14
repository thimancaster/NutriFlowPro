
import React, { ReactNode } from 'react';
import { PatientProvider } from '@/contexts/PatientContext';
import { ConsultationDataProvider } from '@/contexts/ConsultationDataContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { ConsultationProvider } from '@/contexts/ConsultationContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ProtectedLayoutProps {
  children: ReactNode;
}

/**
 * Layout component for protected routes
 * Wraps all the context providers needed for authenticated pages
 */
const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <PatientProvider>
        <ConsultationDataProvider>
          <MealPlanProvider>
            <ConsultationProvider>
              {children}
            </ConsultationProvider>
          </MealPlanProvider>
        </ConsultationDataProvider>
      </PatientProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
