import React, {Suspense} from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Import only the landing page directly - all other pages are lazy loaded
import Index from "@/pages/Index";

// Lazy load all other pages to reduce initial bundle size
const Login = React.lazy(() => import("@/pages/Login"));
const ForgotPassword = React.lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("@/pages/ResetPassword"));
const Pricing = React.lazy(() => import("@/pages/Pricing"));
const Recursos = React.lazy(() => import("@/pages/Recursos"));
const UnifiedSignup = React.lazy(() => import("@/pages/UnifiedSignup"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const AuthHandler = React.lazy(() => import("@/components/auth/AuthHandler"));
const ProtectedLayout = React.lazy(() => import("@/components/layouts/ProtectedLayout"));

// Protected pages - all lazy loaded
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Patients = React.lazy(() => import("@/pages/Patients"));
const Calculator = React.lazy(() => import("@/pages/Calculator"));
const Appointments = React.lazy(() => import("@/pages/Appointments"));
const Clinical = React.lazy(() => import("@/pages/Clinical"));
const FoodDatabase = React.lazy(() => import("@/pages/FoodDatabase"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const PatientAnthropometry = React.lazy(() => import("@/pages/PatientAnthropometry"));
const PatientHistory = React.lazy(() => import("@/pages/PatientHistory"));
const SystemDebug = React.lazy(() => import("@/pages/SystemDebug"));
const AdminProtectedLayout = React.lazy(() => import("@/components/layouts/AdminProtectedLayout"));
const AdminPanel = React.lazy(() => import("@/pages/AdminPanel"));
const AdminFoods = React.lazy(() => import("@/pages/AdminFoods"));
const Reports = React.lazy(() => import("@/pages/Reports"));
const Gamification = React.lazy(() => import("@/pages/Gamification"));
const Onboarding = React.lazy(() => import("@/pages/Onboarding"));
const AddTestimonial = React.lazy(() => import("@/pages/AddTestimonial"));
const Subscription = React.lazy(() => import("@/pages/Subscription"));
const PatientNew = React.lazy(() => import("@/pages/PatientNew"));
const PatientEdit = React.lazy(() => import("@/pages/PatientEdit"));
const PatientProfile = React.lazy(() => import("@/pages/PatientProfile"));
const MealPlans = React.lazy(() => import("@/pages/MealPlans"));
const MealPlanView = React.lazy(() => import("@/pages/MealPlanView"));
const MealPlanBuilder = React.lazy(() => import("@/pages/MealPlanBuilder"));
const TestE2E = React.lazy(() => import("@/pages/TestE2E"));

const AppRoutes = () => {
	return (
		<Suspense fallback={<LoadingSpinner />}>
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
					<Route path="patients/new" element={<PatientNew />} />
					<Route path="patients/edit/:id" element={<PatientEdit />} />
					<Route path="patients/:id" element={<PatientProfile />} />
					<Route path="calculator" element={<Calculator />} />
					<Route path="meal-plans" element={<MealPlans />} />
					<Route path="meal-plan-builder" element={<MealPlanBuilder />} />
					<Route path="meal-plan-builder/:planId" element={<MealPlanBuilder />} />
					<Route path="meal-plan/:id" element={<MealPlanView />} />
					<Route path="appointments" element={<Appointments />} />
					<Route path="clinical" element={<Clinical />} />
					<Route path="clinical/:patientId" element={<Clinical />} />
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
		</Suspense>
	);
};

export default AppRoutes;
