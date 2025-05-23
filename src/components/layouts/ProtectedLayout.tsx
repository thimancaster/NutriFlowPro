
import React from 'react';
import { Outlet } from 'react-router-dom';
import { PatientProvider } from '@/contexts/patient/PatientContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { ConsultationProvider } from '@/contexts/ConsultationContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

/**
 * Layout component for protected routes
 * Wraps all the context providers needed for authenticated pages
 */
const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <PatientProvider>
        <MealPlanProvider>
          <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Outlet />
            </div>
          </div>
        </MealPlanProvider>
      </PatientProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
