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
import MealPlanGenerator from "@/pages/MealPlanGenerator";
import MealPlanWorkflowPage from "@/pages/MealPlanWorkflowPage";
import MealPlanEditor from "@/pages/MealPlanEditor";
import Appointments from "@/pages/Appointments";
import Clinical from "@/pages/Clinical";
import Consultation from "@/pages/Consultation";
import FoodDatabase from "@/pages/FoodDatabase";
import Settings from "@/pages/Settings";
import PatientAnthropometry from "@/pages/PatientAnthropometry";
import PatientHistory from "@/pages/PatientHistory";
import SystemDebug from "@/pages/SystemDebug";
import AdminPanel from "@/pages/AdminPanel";

// Lazy load some other pages
const PatientNew = React.lazy(() => import("@/pages/PatientNew"));
const PatientEdit = React.lazy(() => import("@/pages/PatientEdit"));
const PatientProfile = React.lazy(() => import("@/pages/PatientProfile"));
const MealPlans = React.lazy(() => import("@/pages/MealPlans"));
const MealPlanView = React.lazy(() => import("@/pages/MealPlanView"));
const ClinicalConsultation = React.lazy(() => import("@/pages/ClinicalConsultation"));
const MealPlanBuilder = React.lazy(() => import("@/pages/MealPlanBuilder"));
import MealPlanBuilderV2 from "@/pages/MealPlanBuilderV2";
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
				<Route path="meal-plan-generator" element={<MealPlanGenerator />} />
				<Route path="meal-plan-workflow" element={<MealPlanWorkflowPage />} />
				<Route path="meal-plan-editor/:id" element={<MealPlanEditor />} />
				<Route
					path="meal-plan-builder"
					element={
						<Suspense fallback={<LoadingSpinner />}>
							<MealPlanBuilder />
						</Suspense>
					}
				/>
				<Route
					path="meal-plan-builder-v2"
					element={
						<Suspense fallback={<LoadingSpinner />}>
							<MealPlanBuilderV2 />
						</Suspense>
					}
				/>
				<Route path="test-e2e" element={<TestE2E />} />
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
				<Route
					path="clinical/consultation/:patientId?"
					element={
						<Suspense fallback={<LoadingSpinner />}>
							<ClinicalConsultation />
						</Suspense>
					}
				/>
				<Route path="patient-history/:id" element={<PatientHistory />} />
				<Route path="patient-anthropometry/:id" element={<PatientAnthropometry />} />
				<Route path="consultation" element={<Consultation />} />
				<Route path="consultation/:patientId" element={<Consultation />} />
				<Route path="food-database" element={<FoodDatabase />} />
				<Route path="settings" element={<Settings />} />
				<Route path="subscription" element={<Subscription />} />
				<Route path="add-testimonial" element={<AddTestimonial />} />
				<Route path="system-debug" element={<SystemDebug />} />
				<Route path="admin" element={<AdminPanel />} />
			</Route>

			{/* Default fallback - always last */}
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
};

export default AppRoutes;
