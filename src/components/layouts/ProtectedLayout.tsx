import React from 'react';
import { Outlet } from 'react-router-dom';
import { PatientProvider } from '@/contexts/patient/PatientContext';
import { UnifiedNutritionProvider } from '@/contexts/UnifiedNutritionContext';
import { ConsultationDataProvider } from '@/contexts/ConsultationDataContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import TestimonialReminder from '@/components/notifications/TestimonialReminder';

/**
 * Layout component for protected routes
 * Wraps all the context providers needed for authenticated pages
 * Unified ecosystem with single clinical context
 */
const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <PatientProvider>
        <UnifiedNutritionProvider>
          <ConsultationDataProvider>
            <Layout>
              <Outlet />
              {/* Reminder para testimonials após 7 dias de uso */}
              <TestimonialReminder minDaysBeforeShow={7} />
            </Layout>
          </ConsultationDataProvider>
        </UnifiedNutritionProvider>
      </PatientProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
