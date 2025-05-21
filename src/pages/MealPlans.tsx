import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePatient } from '@/contexts/PatientContext';
import MealAssembly from '@/components/MealPlan/MealAssembly';
import PatientBanner from '@/components/patient/PatientBanner';
import ContextualNavigation from '@/components/patient/ContextualNavigation';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const MealPlans = () => {
  const { activePatient, loadPatientById } = usePatient();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const patientId = searchParams.get('patientId');
  const createPlan = searchParams.get('createPlan') === 'true';
  
  // Get calculation data from location state if available
  const calculationData = location.state?.calculationData;

  // Load patient if patientId is provided in URL but not active yet
  useEffect(() => {
    if (patientId && (!activePatient || activePatient.id !== patientId)) {
      loadPatientById(patientId);
    }
  }, [patientId, activePatient, loadPatientById]);

  return (
    <div className="container mx-auto px-4 py-8">
      <ContextualNavigation currentModule="meal-plans" />
      
      <motion.div 
        className="flex flex-col md:flex-row items-center justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-3 text-nutri-blue">Planos Alimentares</h1>
          <p className="text-gray-600 mb-4">Crie planos alimentares personalizados com quantidades precisas para seus pacientes.</p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
          alt="Alimentos saudáveis" 
          className="w-full md:w-1/3 rounded-xl shadow-lg mt-4 md:mt-0"
        />
      </motion.div>
      
      {/* Display patient banner if patient is selected */}
      {activePatient && <PatientBanner />}
      
      {!activePatient && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="flex justify-between items-center">
            <span>Selecione um paciente para criar um plano alimentar personalizado.</span>
            <Button variant="nutri" size="sm">
              Selecionar Paciente
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <motion.div 
        className="bg-white rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MealAssembly 
          totalCalories={calculationData?.tdee || 2000}
          macros={{
            protein: calculationData?.protein || 150,
            carbs: calculationData?.carbs || 200,
            fat: calculationData?.fat || 67
          }}
          patientName={activePatient?.name || "Exemplo de Paciente"}
          patientData={{
            age: activePatient?.age || 35,
            weight: activePatient?.measurements?.weight || 70,
            height: activePatient?.measurements?.height || 170
          }}
          patientId={activePatient?.id}
        />
      </motion.div>
      
      <motion.div 
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
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
      </motion.div>
    </div>
  );
};

export default MealPlans;
