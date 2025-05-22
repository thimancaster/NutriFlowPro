
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Main pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import PatientNew from '@/pages/PatientNew';
import PatientHistory from '@/components/PatientHistory';
import PatientAnthropometry from '@/pages/PatientAnthropometry';
import Consultation from '@/pages/Consultation';
import MealPlanGenerator from '@/pages/MealPlanGenerator';
import MealPlans from '@/pages/MealPlans';
import Subscription from '@/pages/Subscription';
import Pricing from '@/pages/Pricing';
import Calculator from '@/pages/Calculator';
import Settings from '@/pages/Settings';
import AddTestimonial from '@/pages/AddTestimonial';
import Appointments from '@/pages/Appointments';
import Clinical from '@/pages/Clinical';

// Public routes that don't require authentication
export const publicRoutes = [
  <Route key="index" path="/" element={<Index />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="register" path="/register" element={<Register />} />,
  <Route key="forgot-password" path="/forgot-password" element={<ForgotPassword />} />,
  <Route key="reset-password" path="/reset-password" element={<ResetPassword />} />,
  <Route key="add-testimonial" path="/add-testimonial" element={<AddTestimonial />} />
];

// Protected routes that require authentication
export const protectedRoutes = [
  <Route key="dashboard" path="/dashboard" element={<Dashboard />} />,
  <Route key="patients" path="/patients" element={<Patients />} />,
  <Route key="patients-new" path="/patients/new" element={<PatientNew />} />,
  <Route key="patients-edit" path="/patients/edit/:id" element={<PatientNew />} />,
  <Route key="appointments" path="/appointments" element={<Appointments />} />,
  <Route key="consultation" path="/consultation/:id?" element={<Consultation />} />,
  <Route key="clinical" path="/clinical" element={<Clinical />} />,
  <Route key="patient-history" path="/patient-history/:patientId" element={<PatientHistory />} />,
  <Route key="patient-anthropometry" path="/patient-anthropometry/:patientId" element={<PatientAnthropometry />} />,
  <Route key="meal-plan-generator" path="/meal-plan-generator" element={<MealPlanGenerator />} />,
  <Route key="meal-plans" path="/meal-plans" element={<MealPlans />} />,
  <Route key="subscription" path="/subscription" element={<Subscription />} />,
  <Route key="pricing" path="/pricing" element={<Pricing />} />,
  <Route key="calculator" path="/calculator" element={<Calculator />} />,
  <Route key="settings" path="/settings" element={<Settings />} />,
  <Route key="not-found" path="*" element={<Navigate to="/" />} />
];

// All routes combined
export const allRoutes = [...publicRoutes, ...protectedRoutes];
