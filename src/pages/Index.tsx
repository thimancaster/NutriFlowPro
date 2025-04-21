
import React from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-nutri-blue">
              <span className="text-nutri-green">Nutri</span>Flow Pro
            </h1>
            <p className="text-gray-600">Sistema completo de gestão nutricional</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80" 
            alt="Nutrição saudável" 
            className="w-full md:w-1/3 rounded-xl shadow-lg mt-4 md:mt-0"
          />
        </div>
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
