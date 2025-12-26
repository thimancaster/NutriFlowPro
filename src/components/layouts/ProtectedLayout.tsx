import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { PatientProvider } from '@/contexts/patient/PatientContext';
import { UnifiedNutritionProvider } from '@/contexts/UnifiedNutritionContext';
import { ConsultationDataProvider } from '@/contexts/ConsultationDataContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import TestimonialReminder from '@/components/notifications/TestimonialReminder';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { Loader2 } from 'lucide-react';

/**
 * Layout component for protected routes
 * Wraps all the context providers needed for authenticated pages
 * Unified ecosystem with single clinical context
 * Includes onboarding verification
 */
const ProtectedLayout: React.FC = () => {
  const location = useLocation();
  const { shouldRedirectToOnboarding, isChecking } = useOnboardingCheck();

  // Show loading while checking onboarding status
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando configuração...</p>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if not completed (avoid infinite loop)
  if (shouldRedirectToOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

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
