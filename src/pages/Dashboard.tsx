
import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import DashboardComponent from '@/components/Dashboard';
import UserInfoHeader from '@/components/UserInfoHeader';
import ConsultationHeader from '@/components/ConsultationHeader';
import UsageLimits from '@/components/UsageLimits';
import { motion } from 'framer-motion';
import { useConsultation } from '@/contexts/ConsultationContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { isConsultationActive } = useConsultation();
  const { user } = useAuth();
  const { dashboardData } = useDashboardData(user?.id);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Helmet>
        <title>Dashboard - NutriFlow Pro</title>
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-nutri-blue">Dashboard</h1>
        
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
