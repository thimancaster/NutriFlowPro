
import React from 'react';
import { Outlet } from 'react-router-dom';
import { PatientProvider } from '@/contexts/patient/PatientContext';
import { ConsultationDataProvider } from '@/contexts/ConsultationDataContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { ConsultationProvider } from '@/contexts/ConsultationContext';
import ProtectedRoute from '@/components/ProtectedRoute';

/**
 * Layout component for protected routes
 * Wraps all the context providers needed for authenticated pages
 */
const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <PatientProvider>
        <ConsultationDataProvider>
          <MealPlanProvider>
            <ConsultationProvider>
              <Outlet />
            </ConsultationProvider>
          </MealPlanProvider>
        </ConsultationDataProvider>
      </PatientProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
