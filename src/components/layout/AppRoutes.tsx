
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import PatientProfile from '@/pages/PatientProfile';
import PatientsPage from '@/pages/PatientsPage';
import Calculator from '@/pages/Calculator';
import MealPlanPage from '@/pages/MealPlanPage';
import MealPlanGenerator from '@/pages/MealPlanGenerator';
import UnifiedConsultationPage from '@/pages/UnifiedConsultationPage';
import MealPlanWorkflowPage from '@/pages/MealPlanWorkflowPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import TestimonialsPage from '@/pages/TestimonialsPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/patient/:id" element={<PatientProfile />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/meal-plans" element={<MealPlanPage />} />
      <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
      {/* Rota unificada principal - substitui "Fluxo Clínico" */}
      <Route path="/consultation" element={<UnifiedConsultationPage />} />
      <Route path="/meal-plan-workflow" element={<MealPlanWorkflowPage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/testimonials" element={<TestimonialsPage />} />
    </Routes>
  );
};

export default AppRoutes;
