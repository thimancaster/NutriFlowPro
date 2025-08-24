import {lazy} from "react";

// Lazy load heavy components to improve initial bundle size
export const LazyDashboard = lazy(() => import("@/pages/Dashboard"));
export const LazyPatients = lazy(() => import("@/pages/Patients"));
export const LazyCalculator = lazy(() => import("@/pages/Calculator"));
export const LazyMealPlanGenerator = lazy(() => import("@/pages/MealPlanGenerator"));
export const LazyMealPlanWorkflowPage = lazy(() => import("@/pages/MealPlanWorkflowPage"));
export const LazyMealPlanEditor = lazy(() => import("@/pages/MealPlanEditor"));
export const LazyAppointments = lazy(() => import("@/pages/Appointments"));
export const LazyClinical = lazy(() => import("@/pages/Clinical"));
export const LazyConsultation = lazy(() => import("@/pages/Consultation"));
export const LazyFoodDatabase = lazy(() => import("@/pages/FoodDatabase"));
export const LazySettings = lazy(() => import("@/pages/Settings"));

// Lazy load heavy chart components
export const LazyPatientAnthropometry = lazy(() => import("@/pages/PatientAnthropometry"));
export const LazyPatientHistory = lazy(() => import("@/pages/PatientHistory"));

// Lazy load other heavy components that use charts, animations, etc.
export const LazySystemDebug = lazy(() => import("@/pages/SystemDebug"));
