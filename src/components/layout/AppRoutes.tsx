
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import PatientProfile from '@/pages/PatientProfile';
import Patients from '@/pages/Patients';
import Calculator from '@/pages/Calculator';
import MealPlans from '@/pages/MealPlans';
import MealPlanGenerator from '@/pages/MealPlanGenerator';
import UnifiedConsultationPage from '@/pages/UnifiedConsultationPage';
import MealPlanWorkflowPage from '@/pages/MealPlanWorkflowPage';
import Appointments from '@/pages/Appointments';
import Settings from '@/pages/Settings';
import AddTestimonial from '@/pages/AddTestimonial';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/patient/:id" element={<PatientProfile />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/meal-plans" element={<MealPlans />} />
      <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
      <Route path="/consultation" element={<UnifiedConsultationPage />} />
      <Route path="/meal-plan-workflow" element={<MealPlanWorkflowPage />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/testimonials" element={<AddTestimonial />} />
    </Routes>
  );
};

export default AppRoutes;
