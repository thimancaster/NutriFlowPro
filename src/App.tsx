
import React, { useEffect } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from './contexts/auth/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Patients from './pages/Patients';
import PatientNew from './pages/PatientNew';
import PatientHistory from './components/PatientHistory'; 
import Consultation from './pages/Consultation';
import MealPlanGenerator from './pages/MealPlanGenerator';
import Subscription from './pages/Subscription';
import Pricing from './pages/Pricing';
import Calculator from './pages/Calculator';
import MealPlans from './pages/MealPlans';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MealPlanProvider } from './contexts/MealPlanContext';
import ProtectedRoute from './components/ProtectedRoute';
import PatientAnthropometry from './pages/PatientAnthropometry';
import Index from './pages/Index';
import AddTestimonial from './pages/AddTestimonial';
import { seedTestimonials } from './utils/seedTestimonials';
import { supabase } from './integrations/supabase/client';
import Appointments from './pages/Appointments';
import { ConsultationProvider } from './contexts/ConsultationContext';

// Create a client with retry options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  // Seed testimonials when the app loads
  useEffect(() => {
    console.log('App loaded, seeding testimonials...');
    seedTestimonials();
  }, []);

  // Handle auth state changes, especially for OAuth providers like Google
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("User signed in:", session.user);
        
        // Check if we need to create a user profile
        if (session.user.app_metadata.provider === 'google') {
          try {
            console.log("Checking if user profile exists for Google user...");
            const { data: existingUser, error: checkError } = await supabase
              .from('users')
              .select('id')
              .eq('id', session.user.id)
              .single();
              
            if (checkError || !existingUser) {
              // Create user profile for Google user
              console.log("Creating profile for Google user...");
              const { error: profileError } = await supabase
                .from('users')
                .insert([{
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'Usuário Google'
                }]);
                
              if (profileError) {
                console.error("Error creating user profile:", profileError);
              } else {
                console.log("Successfully created profile for Google user");
              }
            } else {
              console.log("User profile already exists for Google user");
            }
          } catch (error) {
            console.error("Error handling Google sign-in:", error);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ErrorBoundary>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/add-testimonial" element={<AddTestimonial />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <Dashboard />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/patients" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <Patients />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/patients/new" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <PatientNew />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <Appointments />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/patient-history/:patientId" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <PatientHistory />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/patient-anthropometry/:patientId" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <PatientAnthropometry />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/consultation" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <Consultation />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/meal-plan-generator" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <MealPlanGenerator />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <Subscription />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/pricing" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <Pricing />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/calculator" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <Calculator />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/meal-plans" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <MealPlans />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <ConsultationProvider>
                    <MealPlanProvider>
                      <Settings />
                    </MealPlanProvider>
                  </ConsultationProvider>
                </ProtectedRoute>
              } />
              
              {/* Redirect any unknown route to the homepage */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
