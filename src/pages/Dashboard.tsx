
import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';

const DashboardPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Dashboard - NutriFlow Pro</title>
      </Helmet>
      <Dashboard />
    </Layout>
  );
};

export default DashboardPage;
