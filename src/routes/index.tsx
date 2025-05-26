
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layout
import Layout from '@/components/Layout';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import PatientNew from '@/pages/PatientNew';
import PatientProfile from '@/pages/PatientProfile';
import Calculator from '@/pages/Calculator';
import MealPlans from '@/pages/MealPlans';
import MealPlanGenerator from '@/pages/MealPlanGenerator';
import Appointments from '@/pages/Appointments';
import Clinical from '@/pages/Clinical';
import PatientHistory from '@/pages/PatientHistory';
import PatientAnthropometry from '@/pages/PatientAnthropometry';
import Consultation from '@/pages/Consultation';
import FoodDatabase from '@/pages/FoodDatabase';
import Settings from '@/pages/Settings';
import Subscription from '@/pages/Subscription';
import Pricing from '@/pages/Pricing';
import NotFound from '@/pages/NotFound';
import Onboarding from '@/pages/Onboarding';
import AddTestimonial from '@/pages/AddTestimonial';
import Recursos from '@/pages/Recursos';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/recursos" element={<Recursos />} />

      {/* Protected routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/new" element={<PatientNew />} />
              <Route path="/patients/edit/:id" element={<PatientNew />} />
              <Route path="/patients/:id" element={<PatientProfile />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/meal-plans" element={<MealPlans />} />
              <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/clinical" element={<Clinical />} />
              <Route path="/clinical/:patientId" element={<Clinical />} />
              <Route path="/patient-history/:id" element={<PatientHistory />} />
              <Route path="/patient-anthropometry/:id" element={<PatientAnthropometry />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/consultation/:patientId" element={<Consultation />} />
              <Route path="/food-database" element={<FoodDatabase />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/add-testimonial" element={<AddTestimonial />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
