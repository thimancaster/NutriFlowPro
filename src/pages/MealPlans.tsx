
import React from 'react';
import Navbar from '@/components/Navbar';
import MealPlanGenerator from '@/components/MealPlanGenerator';

const MealPlans = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Planos Alimentares</h1>
        <MealPlanGenerator />
      </div>
    </div>
  );
};

export default MealPlans;
