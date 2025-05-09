
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import PatientForm from '@/components/PatientForm';

const PatientNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check for new patient data passed from Calculator
  const newPatientData = location.state?.newPatient;
  
  // Effect to show a message if we have patient data
  useEffect(() => {
    if (newPatientData) {
      toast({
        title: "Dados importados",
        description: "Complete o cadastro para salvar o novo paciente.",
      });
    }
  }, [newPatientData, toast]);
  
  const handleSuccess = () => {
    toast({
      title: "Paciente salvo",
      description: "O paciente foi cadastrado com sucesso."
    });
    navigate('/patients');
  };
  
  const handleCancel = () => {
    navigate('/patients');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-nutri-blue mb-2">Novo Paciente</h1>
        <p className="text-gray-600 mb-6">Preencha os dados para cadastrar um novo paciente</p>
        
        <PatientForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          initialData={newPatientData}
        />
      </div>
    </div>
  );
};

export default PatientNew;
