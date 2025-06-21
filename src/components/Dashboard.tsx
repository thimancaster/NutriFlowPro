
import React, { Suspense } from 'react';
import DashboardHero from './DashboardHero';
import DashboardSummaryCards from './DashboardSummaryCards';
import DashboardRecentPatients from './DashboardRecentPatients';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardTestimonials from './DashboardTestimonials';
import ConsultationHeader from './ConsultationHeader';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useSafeConsultation } from '@/hooks/useSafeConsultation';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/auth/AuthContext';

// Loading fallback harmonizado
const LoadingFallback = () => (
  <div className="w-full p-6 bg-card rounded-xl border border-border shadow-sm backdrop-blur-sm">
    <Skeleton className="h-6 w-1/3 mb-4 bg-muted" />
    <Skeleton className="h-32 w-full bg-muted" />
  </div>
);

// Animações refinadas
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

const Dashboard = () => {
  const { isConsultationActive } = useSafeConsultation();
  const { user } = useAuth();
  
  const { 
    isLoading, 
    error,
    dashboardData
  } = useDashboardData(user?.id);
  
  const totalPatients = dashboardData?.patientCount || 0;
  const appointmentsToday = dashboardData?.todayAppointments?.length || 0;
  const activePlans = dashboardData?.activePlans || 0;
  
  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isConsultationActive && (
          <motion.div variants={itemVariants}>
            <ConsultationHeader currentStep="dashboard" />
          </motion.div>
        )}
        
        <motion.div variants={itemVariants}>
          <DashboardHero />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Suspense fallback={<LoadingFallback />}>
            <DashboardSummaryCards 
              totalPatients={totalPatients}
              appointmentsToday={appointmentsToday}
              activePlans={activePlans}
              isLoading={isLoading}
            />
          </Suspense>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Suspense fallback={<LoadingFallback />}>
            <DashboardRecentPatients />
          </Suspense>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <DashboardQuickActions />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <DashboardTestimonials />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
