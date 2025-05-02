
import React, { Suspense } from 'react';
import DashboardHero from './DashboardHero';
import DashboardSummaryCards from './DashboardSummaryCards';
import DashboardRecentPatients from './DashboardRecentPatients';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardTestimonials from './DashboardTestimonials';
import UserInfoHeader from './UserInfoHeader';
import ConsultationHeader from './ConsultationHeader';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useConsultation } from '@/contexts/ConsultationContext';

// Loading fallback component
const LoadingFallback = () => (
  <div className="w-full p-6 bg-white rounded-lg shadow-sm">
    <Skeleton className="h-6 w-1/3 mb-4" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const Dashboard = () => {
  const { isConsultationActive } = useConsultation();
  
  return (
    <div className="space-y-6">
      {isConsultationActive && (
        <ConsultationHeader />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <UserInfoHeader />
      </motion.div>
      
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
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <DashboardSummaryCards />
        </Suspense>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <DashboardRecentPatients />
        </Suspense>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DashboardQuickActions />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DashboardTestimonials />
      </motion.div>
    </div>
  );
};

export default Dashboard;
