import {Routes, Route, Navigate} from "react-router-dom";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import AuthHandler from '@/components/auth/AuthHandler'; // <--- Adicione esta linha

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientNew from "@/pages/PatientNew";
import PatientEdit from "@/pages/PatientEdit";
import PatientProfile from "@/pages/PatientProfile";
import Calculator from "@/pages/Calculator";
import MealPlans from "@/pages/MealPlans";
import MealPlanGenerator from "@/pages/MealPlanGenerator";
import MealPlanWorkflowPage from "@/pages/MealPlanWorkflowPage";
import MealPlanEditor from "@/pages/MealPlanEditor";
import MealPlanView from "@/pages/MealPlanView";
import Appointments from "@/pages/Appointments";
import Clinical from "@/pages/Clinical";
import PatientHistory from "@/pages/PatientHistory";
import PatientAnthropometry from "@/pages/PatientAnthropometry";
import Consultation from "@/pages/Consultation";
import FoodDatabase from "@/pages/FoodDatabase";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import AddTestimonial from "@/pages/AddTestimonial";
import Recursos from "@/pages/Recursos";
import UnifiedSignup from "@/pages/UnifiedSignup";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="recursos" element={<Recursos />} />
            <Route path="auth/callback" element={<AuthHandler />} />

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
                <Route path="meal-plan-generator" element={<MealPlanGenerator />} />
                <Route path="meal-plan-workflow" element={<MealPlanWorkflowPage />} />
                <Route path="meal-plan-editor/:id" element={<MealPlanEditor />} />
                <Route path="meal-plan/:id" element={<MealPlanView />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="clinical" element={<Clinical />} />
                <Route path="clinical/:patientId" element={<Clinical />} />
                <Route path="patient-history/:id" element={<PatientHistory />} />
                <Route path="patient-anthropometry/:id" element={<PatientAnthropometry />} />
                <Route path="consultation" element={<Consultation />} />
                <Route path="consultation/:patientId" element={<Consultation />} />
                <Route path="food-database" element={<FoodDatabase />} />
                <Route path="settings" element={<Settings />} />
                <Route path="subscription" element={<Subscription />} />
                <Route path="add-testimonial" element={<AddTestimonial />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;