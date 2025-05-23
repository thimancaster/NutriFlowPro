
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/toast';
import Navbar from '@/components/Navbar';
import PatientForm from '@/components/PatientForm';
import { useQuery } from '@tanstack/react-query';
import { PatientService } from '@/services/patient';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PatientResponse } from '@/services/patient/operations/getPatient';

const PatientNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check for new patient data passed from Calculator
  const newPatientData = location.state?.newPatient;

  // Fetch patient data if in edit mode
  const { data: patientResponse, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) return null;
      
      const result = await PatientService.getPatient(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch patient');
      }
      
      return result;
    },
    enabled: !!id && !!user,
  });
  
  // Extract patient data from response
  const patientData = patientResponse?.success ? patientResponse.data : null;
  
  // Effect to show a message if we have patient data
  useEffect(() => {
    if (newPatientData) {
      toast({
        title: "Dados importados",
        description: "Complete o cadastro para salvar o novo paciente.",
      });
    }
  }, [newPatientData, toast]);

  useEffect(() => {
    if (id && patientData && user && patientData.user_id !== user.id) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para editar este paciente.",
        variant: "destructive",
      });
      navigate('/patients');
    }
  }, [id, patientData, user, navigate, toast]);
  
  const handleSuccess = () => {
    toast({
      title: id ? "Paciente atualizado" : "Paciente salvo",
      description: id 
        ? "O paciente foi atualizado com sucesso." 
        : "O paciente foi cadastrado com sucesso."
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
        <h1 className="text-3xl font-bold text-nutri-blue mb-2">
          {id ? 'Editar Paciente' : 'Novo Paciente'}
        </h1>
        <p className="text-gray-600 mb-6">
          {id 
            ? 'Atualize os dados do paciente conforme necessário' 
            : 'Preencha os dados para cadastrar um novo paciente'
          }
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutri-blue"></div>
          </div>
        ) : (
          <PatientForm 
            onSuccess={handleSuccess} 
            onCancel={handleCancel}
            initialData={newPatientData}
            editPatient={patientData}
          />
        )}
      </div>
    </div>
  );
};

export default PatientNew;
