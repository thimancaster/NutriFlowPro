
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import DashboardComponent from '@/components/Dashboard';
import DashboardHero from '@/components/DashboardHero';
import UserInfoHeader from '@/components/UserInfoHeader';
import ConsultationHeader from '@/components/ConsultationHeader';
import UsageLimits from '@/components/UsageLimits';
import { motion } from 'framer-motion';
import { useConsultation } from '@/contexts/ConsultationContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { user } = useAuth();
  const { isConsultationActive } = useConsultation();
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
          className="mb-8"
        >
          <DashboardHero />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <UserInfoHeader />
        </motion.div>
        
        <div className="space-y-6">
          {isConsultationActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ConsultationHeader currentStep="dashboard" />
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mb-6"
          >
            <UsageLimits />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <DashboardComponent />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
