import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import PatientProfile from '@/pages/PatientProfile';
import Patients from '@/pages/Patients';
import Calculator from '@/pages/Calculator';
import MealPlans from '@/pages/MealPlans';
import MealPlanGenerator from '@/pages/MealPlanGenerator';
import MealPlanWorkflowPage from '@/pages/MealPlanWorkflowPage';
import Appointments from '@/pages/Appointments';
import Settings from '@/pages/Settings';
import AddTestimonial from '@/pages/AddTestimonial';
import NutritionWorkflow from '@/pages/NutritionWorkflow';
import Atendimento from '@/pages/Atendimento';
import Reports from '@/pages/Reports';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/patient/:id" element={<PatientProfile />} />
      
      <Route path="/atendimento" element={<Atendimento />} />
      <Route path="/atendimento/:patientId" element={<Atendimento />} />
      
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/nutrition-workflow" element={<NutritionWorkflow />} />
      <Route path="/meal-plan-workflow" element={<MealPlanWorkflowPage />} />
      
      <Route path="/meal-plans" element={<MealPlans />} />
      <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/testimonials" element={<AddTestimonial />} />
    </Routes>
  );
};

export default AppRoutes;
