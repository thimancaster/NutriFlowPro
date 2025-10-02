import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import AuthHandler from '@/components/auth/AuthHandler';
import { SuspenseLoading } from '@/components/LazyComponents';

// Importações dinâmicas (Lazy Loading) para as páginas
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/UnifiedSignup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Patients = lazy(() => import('@/pages/Patients'));
const PatientProfile = lazy(() => import('@/pages/PatientProfile'));
const Appointments = lazy(() => import('@/pages/AppointmentsPage'));
const Clinical = lazy(() => import('@/pages/Clinical'));
const MealPlans = lazy(() => import('@/pages/MealPlans'));
const FoodDatabase = lazy(() => import('@/pages/FoodDatabase'));
const Settings = lazy(() => import('@/pages/SettingsPage'));
const Subscription = lazy(() => import('@/pages/Subscription'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const SystemDebug = lazy(() => import('@/pages/SystemDebug'));
const Calculator = lazy(() => import('@/pages/Calculator'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthHandler />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <SuspenseLoading>
              <Dashboard />
            </SuspenseLoading>
          }
        />
        <Route
          path="patients"
          element={
            <SuspenseLoading>
              <Patients />
            </SuspenseLoading>
          }
        />
        <Route
          path="patients/:patientId"
          element={
            <SuspenseLoading>
              <PatientProfile />
            </SuspenseLoading>
          }
        />
        <Route
          path="appointments"
          element={
            <SuspenseLoading>
              <Appointments />
            </SuspenseLoading>
          }
        />
        <Route
          path="clinical"
          element={
            <SuspenseLoading>
              <Clinical />
            </SuspenseLoading>
          }
        />
        <Route
          path="calculator"
          element={
            <SuspenseLoading>
              <Calculator />
            </SuspenseLoading>
          }
        />
        <Route
          path="meal-plans"
          element={
            <SuspenseLoading>
              <MealPlans />
            </SuspenseLoading>
          }
        />
        <Route
          path="food-database"
          element={
            <SuspenseLoading>
              <FoodDatabase />
            </SuspenseLoading>
          }
        />
        <Route
          path="settings"
          element={
            <SuspenseLoading>
              <Settings />
            </SuspenseLoading>
          }
        />
        <Route
          path="subscription"
          element={
            <SuspenseLoading>
              <Subscription />
            </SuspenseLoading>
          }
        />
        <Route
          path="debug"
          element={
            <SuspenseLoading>
              <SystemDebug />
            </SuspenseLoading>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
