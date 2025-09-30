import { lazy, Suspense } from 'react';
import { Skeleton } from './ui/skeleton';

// Componente de Carregamento Genérico
const FullPageSkeleton = () => (
  <div className="p-8 space-y-4">
    <Skeleton className="h-12 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
);

// Wrapper de Suspense para facilitar o uso
export const SuspenseLoading = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Suspense fallback={<FullPageSkeleton />}>
    {children}
  </Suspense>
);

// --- PÁGINAS LAZY CORRIGIDAS ---
// Removidas as importações para páginas deletadas como:
// - Consultation
// - NutritionWorkflow
// - MealPlanWorkflowPage
// - Atendimento
// - ClinicalConsultation
// - ConsolidatedConsultationPage
// - E2EConsultationPage

export const LazyIndex = lazy(() => import('@/pages/Index'));
export const LazyLogin = lazy(() => import('@/pages/Login'));
export const LazySignup = lazy(() => import('@/pages/UnifiedSignup'));
export const LazyForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
export const LazyResetPassword = lazy(() => import('@/pages/ResetPassword'));
export const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
export const LazyPatients = lazy(() => import('@/pages/Patients'));
export const LazyPatientProfile = lazy(() => import('@/pages/PatientProfile'));
export const LazyAppointments = lazy(() => import('@/pages/AppointmentsPage'));
export const LazyClinical = lazy(() => import('@/pages/Clinical'));
export const LazyMealPlans = lazy(() => import('@/pages/MealPlans'));
export const LazyFoodDatabase = lazy(() => import('@/pages/FoodDatabase'));
export const LazySettings = lazy(() => import('@/pages/SettingsPage'));
export const LazySubscription = lazy(() => import('@/pages/Subscription'));
export const LazyNotFound = lazy(() => import('@/pages/NotFound'));
export const LazySystemDebug = lazy(() => import('@/pages/SystemDebug'));
