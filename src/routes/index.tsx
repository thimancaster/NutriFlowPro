import React, {Suspense} from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import AuthHandler from "@/components/auth/AuthHandler";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Import only light components directly
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Pricing from "@/pages/Pricing";
import Recursos from "@/pages/Recursos";
import UnifiedSignup from "@/pages/UnifiedSignup";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import AddTestimonial from "@/pages/AddTestimonial";
import Subscription from "@/pages/Subscription";

// Import main pages directly for now to avoid conflicts
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import Calculator from "@/pages/Calculator";
import Appointments from "@/pages/Appointments";
import Clinical from "@/pages/Clinical";
import Consultation from "@/pages/Consultation";
import FoodDatabase from "@/pages/FoodDatabase";
import Settings from "@/pages/Settings";
import PatientAnthropometry from "@/pages/PatientAnthropometry";
import PatientHistory from "@/pages/PatientHistory";
import SystemDebug from "@/pages/SystemDebug";
import AdminProtectedLayout from "@/components/layouts/AdminProtectedLayout";
import AdminPanel from "@/pages/AdminPanel";
import AdminFoods from "@/pages/AdminFoods";
import Reports from "@/pages/Reports";
import Gamification from "@/pages/Gamification";

// Lazy load some other pages
const PatientNew = React.lazy(() => import("@/pages/PatientNew"));
const PatientEdit = React.lazy(() => import("@/pages/PatientEdit"));
const PatientProfile = React.lazy(() => import("@/pages/PatientProfile"));
const MealPlans = React.lazy(() => import("@/pages/MealPlans"));
const MealPlanView = React.lazy(() => import("@/pages/MealPlanView"));
// ClinicalConsultation removido - usar Clinical
import MealPlanBuilder from "@/pages/MealPlanBuilder";
import TestE2E from "@/pages/TestE2E";

const AppRoutes = () => {
	return (
		<Routes>
			{/* Public routes */}
			<Route path="/" element={<Index />} />
			<Route path="/login" element={<Login />} />
			<Route path="/forgot-password" element={<ForgotPassword />} />
			<Route path="/reset-password" element={<ResetPassword />} />
			<Route path="/pricing" element={<Pricing />} />
			<Route path="/recursos" element={<Recursos />} />
			<Route path="/auth" element={<AuthHandler />} />
			<Route path="/auth/callback" element={<AuthHandler />} />

			{/* Replace old signup routes with unified version */}
			<Route path="/signup" element={<UnifiedSignup />} />
			<Route path="/register" element={<Navigate to="/signup" replace />} />

			{/* Protected routes using ProtectedLayout */}
			<Route path="/*" element={<ProtectedLayout />}>
				<Route path="dashboard" element={<Dashboard />} />
				<Route path="onboarding" element={<Onboarding />} />
				<Route path="patients" element={<Patients />} />
				<Route
					path="patients/new"
					element={
						<Suspense fallback={<LoadingSpinner />}>
							<PatientNew />
						</Suspense>
					}
				/>
				<Route
					path="patients/edit/:id"
					element={
						<Suspense fallback={<LoadingSpinner />}>
							<PatientEdit />
						</Suspense>
					}
				/>
				<Route
					path="patients/:id"
					element={
						<Suspense fallback={<LoadingSpinner />}>
							<PatientProfile />
						</Suspense>
					}
				/>
				<Route path="calculator" element={<Calculator />} />
				<Route
					path="meal-plans"
					element={
						<Suspense fallback={<LoadingSpinner />}>
							<MealPlans />
						</Suspense>
					}
				/>
				<Route path="meal-plan-builder" element={<MealPlanBuilder />} />
				<Route path="meal-plan-builder/:planId" element={<MealPlanBuilder />} />
				{/* test-e2e movido para /admin/test-e2e */}
				<Route
					path="meal-plan/:id"
					element={
						<Suspense fallback={<LoadingSpinner />}>
							<MealPlanView />
						</Suspense>
					}
				/>
				<Route path="appointments" element={<Appointments />} />
				<Route path="clinical" element={<Clinical />} />
				<Route path="clinical/:patientId" element={<Clinical />} />
			{/* Rota removida - usar /clinical/:patientId */}
				<Route path="patient-history/:id" element={<PatientHistory />} />
				<Route path="patient-anthropometry/:id" element={<PatientAnthropometry />} />
				<Route path="consultation" element={<Navigate to="/clinical" replace />} />
				<Route path="consultation/:patientId" element={<Navigate to="/clinical" replace />} />
				<Route path="food-database" element={<FoodDatabase />} />
				<Route path="settings" element={<Settings />} />
				<Route path="subscription" element={<Subscription />} />
				<Route path="add-testimonial" element={<AddTestimonial />} />
				<Route path="reports" element={<Reports />} />
				<Route path="gamification" element={<Gamification />} />
				
				{/* Admin Protected Routes */}
				<Route element={<AdminProtectedLayout />}>
					<Route path="admin" element={<AdminPanel />} />
					<Route path="admin/foods" element={<AdminFoods />} />
					<Route path="admin/system-debug" element={<SystemDebug />} />
					<Route path="admin/test-e2e" element={<TestE2E />} />
				</Route>
			</Route>

			{/* Default fallback - always last */}
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
};

export default AppRoutes;
