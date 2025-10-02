import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import PatientProfile from '@/pages/PatientProfile';
import Patients from '@/pages/Patients';
import Calculator from '@/pages/Calculator';
import MealPlans from '@/pages/MealPlans';
import MealPlanGenerator from '@/pages/MealPlanGenerator';
import Appointments from '@/pages/Appointments';
import Settings from '@/pages/Settings';
import AddTestimonial from '@/pages/AddTestimonial';
import Clinical from '@/pages/Clinical';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/patient/:id" element={<PatientProfile />} />
      
      {/* Rotas clínicas unificadas */}
      <Route path="/clinical" element={<Clinical />} />
      <Route path="/clinico" element={<Clinical />} />
      
      <Route path="/calculator" element={<Calculator />} />
      
      <Route path="/meal-plans" element={<MealPlans />} />
      <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/testimonials" element={<AddTestimonial />} />
    </Routes>
  );
};

export default AppRoutes;
