
import React from 'react';
import { Outlet } from 'react-router-dom';
import { PatientProvider } from '@/contexts/patient/PatientContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { ConsultationProvider } from '@/contexts/ConsultationContext';
import { ConsultationDataProvider } from '@/contexts/ConsultationDataContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

/**
 * Layout component for protected routes
 * Wraps all the context providers needed for authenticated pages
 */
const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <PatientProvider>
        <MealPlanProvider>
          <ConsultationDataProvider>
            <ConsultationProvider>
              <Layout>
                <Outlet />
              </Layout>
            </ConsultationProvider>
          </ConsultationDataProvider>
        </MealPlanProvider>
      </PatientProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
