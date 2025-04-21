
import React from 'react';
import Navbar from '@/components/Navbar';
import MealPlanGenerator from '@/components/MealPlanGenerator';

const MealPlans = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-3 text-nutri-blue">Planos Alimentares</h1>
            <p className="text-gray-600 mb-4">Crie planos alimentares personalizados com quantidades precisas para seus pacientes.</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
            alt="Alimentos saudáveis" 
            className="w-full md:w-1/3 rounded-xl shadow-lg mt-4 md:mt-0"
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <MealPlanGenerator />
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-nutri-green">Personalizado</h3>
            <p className="text-gray-600">Planos alimentares adaptados às necessidades e preferências individuais de cada paciente.</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-nutri-blue">Preciso</h3>
            <p className="text-gray-600">Quantidades e porções exatas para facilitar o seguimento do plano pelo paciente.</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-nutri-teal">Profissional</h3>
            <p className="text-gray-600">Apresentação profissional com informações nutricionais completas e detalhadas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlans;
