
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import DashboardComponent from '@/components/Dashboard';
import UserInfoHeader from '@/components/UserInfoHeader';
import ConsultationHeader from '@/components/ConsultationHeader';
import UsageLimits from '@/components/UsageLimits';
import { motion } from 'framer-motion';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Use try-catch to handle contexts that might not be available
  let isConsultationActive = false;
  try {
    const context = useConsultationData();
    isConsultationActive = context.isConsultationActive;
  } catch {
    // Context not available, use default values
    isConsultationActive = false;
  }
  
  const { dashboardData } = useDashboardData(user?.id);
  
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard - NutriFlow Pro</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Dashboard</h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UserInfoHeader />
        </motion.div>
        
        <div className="space-y-6">
          {isConsultationActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ConsultationHeader currentStep="dashboard" />
            </motion.div>
          )}
          
          {/* Add usage limits card for free users */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6"
          >
            <UsageLimits />
          </motion.div>
          
          <DashboardComponent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
