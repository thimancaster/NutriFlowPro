
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { PatientProvider } from "@/contexts/patient/PatientContext";
import { ConsultationDataProvider } from "@/contexts/ConsultationDataContext";
import Index from "./pages/Index";
import Patients from "./pages/Patients";
import Calculator from "./pages/Calculator";
import MealPlans from "./pages/MealPlans";
import FoodDatabase from "./pages/FoodDatabase";
import Clinical from "./pages/Clinical";
import Consultation from "./pages/Consultation";
import MealPlanGenerator from "./pages/MealPlanGenerator";
import Dashboard from "./pages/Dashboard";
import PatientDetail from "./pages/PatientDetail";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PatientProvider>
            <ConsultationDataProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/patients/new" element={<Patients />} />
                  <Route path="/patients/:id" element={<PatientDetail />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/meal-plans" element={<MealPlans />} />
                  <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
                  <Route path="/food-database" element={<FoodDatabase />} />
                  <Route path="/clinical" element={<Clinical />} />
                  <Route path="/consultation/:id?" element={<Consultation />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/pricing" element={<Pricing />} />
                </Routes>
              </BrowserRouter>
            </ConsultationDataProvider>
          </PatientProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
