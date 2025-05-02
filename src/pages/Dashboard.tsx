
import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import DashboardHero from '@/components/DashboardHero';
import DashboardSummaryCards from '@/components/DashboardSummaryCards';
import DashboardRecentPatients from '@/components/DashboardRecentPatients';
import DashboardQuickActions from '@/components/DashboardQuickActions';
import DashboardTestimonials from '@/components/DashboardTestimonials';
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
        {isConsultationActive && (
          <ConsultationHeader />
        )}
        
        <h1 className="text-3xl font-bold mb-6 text-nutri-blue">Dashboard</h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UserInfoHeader />
        </motion.div>
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardHero />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              <DashboardSummaryCards 
                totalPatients={totalPatients}
                appointmentsToday={appointmentsToday}
                activePlans={activePlans}
              />
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <DashboardRecentPatients />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <DashboardQuickActions />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <DashboardTestimonials />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
