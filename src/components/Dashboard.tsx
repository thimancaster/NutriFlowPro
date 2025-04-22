
import React from 'react';
import DashboardHero from './DashboardHero';
import DashboardSummaryCards from './DashboardSummaryCards';
import DashboardRecentPatients from './DashboardRecentPatients';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardTestimonials from './DashboardTestimonials';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <DashboardHero />
      <DashboardSummaryCards />
      <DashboardRecentPatients />
      <DashboardQuickActions />
      <DashboardTestimonials />
    </div>
  );
};

export default Dashboard;
