
import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import DashboardComponent from '@/components/Dashboard';
import UserInfoHeader from '@/components/UserInfoHeader';
import ConsultationHeader from '@/components/ConsultationHeader';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useConsultation } from '@/contexts/ConsultationContext';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { isConsultationActive } = useConsultation();
  const { totalPatients, appointmentsToday, activePlans, isLoading } = useDashboardData();
  
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
              <ConsultationHeader />
            </motion.div>
          )}
          
          <DashboardComponent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
