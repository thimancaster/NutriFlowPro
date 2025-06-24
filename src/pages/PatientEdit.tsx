import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { PatientService } from '@/services/patient';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PatientForm } from '@/components/PatientForm';

const PatientEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch patient data
  const { data: patientResponse, isLoading, error } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do paciente não fornecido');
      
      const result = await PatientService.getPatient(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Falha ao carregar dados do paciente');
      }
      
      return result;
    },
    enabled: !!id && !!user,
  });
  
  // Extract patient data from response
  const patientData = patientResponse?.success ? patientResponse.data : null;
  
  // Check permissions
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
      title: "Paciente atualizado",
      description: "Os dados do paciente foram atualizados com sucesso."
    });
    navigate('/patients');
  };
  
  const handleCancel = () => {
    navigate('/patients');
  };

  const handleGoBack = () => {
    navigate('/patients');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-nutri-blue" />
              <span className="text-nutri-blue">Carregando dados do paciente...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Erro ao carregar paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {error?.message || 'Não foi possível carregar os dados do paciente.'}
              </p>
              <Button onClick={handleGoBack} variant="outline">
                Voltar à lista de pacientes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-nutri-blue mb-2">
            Editar Paciente
          </h1>
          <p className="text-gray-600">
            Atualize os dados de <span className="font-semibold">{patientData.name}</span>
          </p>
        </div>
        
        <PatientForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          editPatient={patientData}
        />
      </div>
    </div>
  );
};

export default PatientEdit;
