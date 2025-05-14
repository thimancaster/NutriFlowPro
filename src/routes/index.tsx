
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedLayout from '@/components/layouts/ProtectedLayout';

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
  <Route key="dashboard" path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />,
  <Route key="patients" path="/patients" element={<ProtectedLayout><Patients /></ProtectedLayout>} />,
  <Route key="patients-new" path="/patients/new" element={<ProtectedLayout><PatientNew /></ProtectedLayout>} />,
  <Route key="patients-edit" path="/patients/edit/:id" element={<ProtectedLayout><PatientNew /></ProtectedLayout>} />,
  <Route key="appointments" path="/appointments" element={<ProtectedLayout><Appointments /></ProtectedLayout>} />,
  <Route key="patient-history" path="/patient-history/:patientId" element={<ProtectedLayout><PatientHistory /></ProtectedLayout>} />,
  <Route key="patient-anthropometry" path="/patient-anthropometry/:patientId" element={<ProtectedLayout><PatientAnthropometry /></ProtectedLayout>} />,
  <Route key="consultation" path="/consultation" element={<ProtectedLayout><Consultation /></ProtectedLayout>} />,
  <Route key="meal-plan-generator" path="/meal-plan-generator" element={<ProtectedLayout><MealPlanGenerator /></ProtectedLayout>} />,
  <Route key="meal-plans" path="/meal-plans" element={<ProtectedLayout><MealPlans /></ProtectedLayout>} />,
  <Route key="subscription" path="/subscription" element={<ProtectedLayout><Subscription /></ProtectedLayout>} />,
  <Route key="pricing" path="/pricing" element={<ProtectedLayout><Pricing /></ProtectedLayout>} />,
  <Route key="calculator" path="/calculator" element={<ProtectedLayout><Calculator /></ProtectedLayout>} />,
  <Route key="settings" path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />,
  <Route key="not-found" path="*" element={<Navigate to="/" />} />
];

// All routes combined
export const allRoutes = [...publicRoutes, ...protectedRoutes];
